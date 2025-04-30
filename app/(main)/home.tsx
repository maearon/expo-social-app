import { View, Text, Button, Alert, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { supabase } from '../../lib/supabase'
// import { useAuth } from '../../contexts/AuthContext'
import {Svg, Circle, Path} from 'react-native-svg';
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import { Image } from 'expo-image'
import { getUserImageSrc } from '../../services/imageService'
import { hp, wp } from '../../helpers/common'
import { useRouter } from 'expo-router'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userService'
import Avatar from '../../components/Avatar'
import micropostApi, { CreateResponse, ListResponse, Micropost } from '../../services/micropostApi'
import { useAppSelector } from '../../redux/hooks'
import { fetchUser, selectUser } from '../../redux/session/sessionSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../redux/store'; // Adjust the path to your store file
var limit = 0;
const HomeScreen = () => {
    const [page, setPage] = useState(1)
    // const {user, setAuth} = useAuth();
    const userData = useAppSelector(selectUser)
    const dispatch: AppDispatch = useDispatch();
    const router = useRouter();
    const [feedItems, setFeedItems] = useState<any[]>([])
    const [hasMore, setHasMore] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    // const onLogout = async () => {
    //     setAuth(null);
    //     const {error} = await supabase.auth.signOut();
    //     if (error) {
    //       Alert.alert("Error Signing Out User", error.message);
    //     }
    // }

    interface PostEventPayload {
      eventType: 'INSERT' | 'DELETE' | 'UPDATE';
      new?: {
      id: number;
      userId: number;
      body?: string;
      file?: string;
      };
      old?: {
      id: number;
      };
    }

    interface UserDataResponse {
      success: boolean;
      data?: Record<string, any>;
    }

    const handlePostEvent = async (payload: PostEventPayload): Promise<void> => {
      console.log('got post event: ', payload);
      if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost: { id: number; userId: number; body?: string; file?: string; user?: any; postLikes?: any[]; comments?: { count: number }[] } = { ...payload.new };
      let res: UserDataResponse = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      newPost.postLikes = []; // while adding likes
      newPost.comments = [{ count: 0 }]; // while adding comments
      setFeedItems((prevPosts) => [newPost, ...prevPosts]);
      }

      if (payload.eventType === 'DELETE' && payload?.old?.id) {
      setFeedItems((prevPosts) => {
        let updatedPosts = prevPosts.filter((post) => post.id !== payload.old?.id);
        return updatedPosts;
      });
      }

      if (payload.eventType === 'UPDATE' && payload?.new?.id) {
      setFeedItems((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
        if (payload.new && post.id === payload.new.id) {
          post.body = payload.new.body;
          post.file = payload.new.file;
        }
        return post;
        });
        return updatedPosts;
      });
      }
    };

    interface NotificationEventPayload {
      eventType: 'INSERT' | 'DELETE' | 'UPDATE';
      new?: {
      id: number;
      [key: string]: any;
      };
      old?: {
      id: number;
      [key: string]: any;
      };
    }

    const handleNewNotification = (payload: NotificationEventPayload): void => {
      console.log('got new notification : ', payload);
      if (payload.eventType === 'INSERT' && payload?.new?.id) {
      setNotificationCount((prev: number) => prev + 10);
      }
    };

    // useEffect(()=>{
      
    //   // // if you want to listen to single event on a table
    //   // let postsChannel = supabase
    //   // .channel('posts')
    //   // .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handlePostEvent)
    //   // .subscribe();


    //   // listen all events on a table
    //   let postChannel = supabase
    //   .channel('posts')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
    //   .subscribe();

    //   let notificationChannel = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}`, }, handleNewNotification)
    //   .subscribe();

    //   // getPosts();

    //   return ()=>{
    //     supabase.removeChannel(postChannel);
    //     supabase.removeChannel(notificationChannel);
    //   }

    // },[]);

    const setFeeds = useCallback(async () => { 
      micropostApi.getAll({page: page}
      ).then(async (response: ListResponse<Micropost>) => {
        if (response.feed_items) {
          const updatedFeedItems = await Promise.all(
            response.feed_items.map(async (item) => {
              return micropostApi.transformForPostCard(item);
            })
          );
          setFeedItems((prev) => [...prev, ...updatedFeedItems])
          // setTotalCount(response.total_count)
          // setFollowing(response.following)
          // setFollowers(response.followers)
          // setMicropost(response.micropost)
          // setGavatar(response.gravatar)
          console.log('feed items 1: ', feedItems);
        } else {
          setFeedItems([])
        }
      })
      .catch((error: any) => {
        // flashMessage('error', 'Set feed unsuccessfully')
      })
    }, [page])

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          await dispatch(fetchUser());
        } catch (error) {
          // flashMessage('error', 'Failed to fetch user')
        } finally {
          setFeeds();
          handleNewNotification({
            eventType: 'INSERT',
            new: { id: 0 } // Replace with appropriate mock data or actual payload
          });
          // setLoading(false);
        }
      };
  
      fetchUserData();

      return ()=>{
      }
  
    }, [dispatch, setFeeds]);
    
    const getPosts = async ()=>{

      if(!hasMore) return null; // if no more posts then don't call the api
      limit = limit+5; // get 10 more posts everytime
      console.log('fetching posts: ', limit);
      micropostApi.getAll({page: page}
      ).then(async (response: ListResponse<Micropost>) => {
        if (response.feed_items) {
          const updatedFeedItems = await Promise.all(
            response.feed_items.map(async (item) => {
              return micropostApi.transformForPostCard(item);
            })
          );
          // setFeedItems(updatedFeedItems)
          // setTotalCount(response.total_count)
          // setFollowing(response.following)
          // setFollowers(response.followers)
          // setMicropost(response.micropost)
          // setGavatar(response.gravatar)
          if(response.total_count){
            if(feedItems.length==response.total_count) setHasMore(false);
            setFeedItems((prev) => [...prev, ...updatedFeedItems])
            console.log('feed items 2: ', feedItems);
          }
        } else {
          setFeedItems([])
        }
      })
      .catch((error: any) => {
        // flashMessage('error', 'Set feed unsuccessfully')
      })
    }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Pressable>
            <Text style={styles.title}>LinkUp</Text>
          </Pressable>
          <View style={styles.icons}>
            <Pressable onPress={()=> {
              setNotificationCount(0);
              router.push('/notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}  />
              {
                notificationCount>0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable>
            <Pressable onPress={()=> router.push('/newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}  />
            </Pressable>
            <Pressable onPress={()=> router.push('/profile')}>
              <Avatar 
                uri={userData?.value.avatar} 
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={feedItems}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item: { id: number }, index: number) => item.id.toString()}
          renderItem={({ item }: { item: Micropost }) => (
            <PostCard 
              item={item} 
              currentUser={userData}
              router={router} 
            />
          )}
          onEndReached={() => {
            getPosts();
            console.log('got to the end');
          }}
          onEndReachedThreshold={0} //  Specifies how close to the bottom the user must scroll before, 0 -> 1
          ListFooterComponent={hasMore? (
              <View style={{marginVertical: feedItems.length==0? 200: 30}}>
                <Loading />
              </View>
            ):(
              <View style={{marginVertical: 30}}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />

        {/* <Button onPress={onLogout} title="Logout" /> */}
      </View>
      
      

</ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4) // Uncommented and ensured this is a valid ViewStyle property
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4)
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: 'bold'
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: 'bold'
  }
})

export default HomeScreen