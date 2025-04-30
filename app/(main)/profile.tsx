import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, FlatList } from 'react-native'
import React, { useState } from 'react'
import { hp, wp } from '../../helpers/common'
// import { useAuth } from '../../contexts/AuthContext'
import { theme } from '../../constants/theme'
// import { Feather, Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
// import { getUserImageSrc } from '../../services/imageService'
// import { Image } from 'expo-image';
import Header from '../../components/Header'
import ScreenWrapper from '../../components/ScreenWrapper'
import Icon from '../../assets/icons'
import Avatar from '../../components/Avatar'
// import { supabase } from '../../lib/supabase'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import sessionApi from '../../services/sessionApi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAppDispatch } from '../../redux/hooks'
import { fetchUser, selectUser } from "../../redux/session/sessionSlice"
import { useAppSelector } from "../../redux/hooks"
import micropostApi, { CreateResponse, ListResponse, Micropost } from '../../services/micropostApi'

var limit = 0;
const Profile = () => {
  //   const {user, setAuth} = useAuth();
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser)
  const [feedItems, setFeedItems] = useState<any[]>([])
  const [page, setPage] = useState(1)

  // first do this

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
  

//   const onLogout = async () => {
//     setAuth(null);
//     const {error} = await supabase.auth.signOut();
//     if (error) {
//       Alert.alert("Error Signing Out User", error.message);
//     }
//   }   

  const onLogout = async () => {
    const clearStorage = async () => {
      await AsyncStorage.multiRemove([
        'token',
        'remember_token',
        'refreshToken',
        'accessToken',
      ]);
    };
  
    try {
        // Call the API to destroy the session
        const response = await sessionApi.destroy();
        
        // Always clear async storage
        await clearStorage();
        await dispatch(fetchUser());  // Fetch user data if needed
        
        // Check the response status
        if (response.status === 401) {
            Alert.alert('Unauthorized', 'You are not authorized to perform this action.');
        }
        
        // Redirect to home page
        router.replace("/welcome")
    } catch (error) {
        Alert.alert("Error Signing Out User", error instanceof Error ? error.message : "An unknown error occurred")
        await clearStorage();
    }
  };

  const handleLogout = ()=>{
    Alert.alert('Confirm', 'Are you sure you want log out?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel'),
          style: 'cancel',
        },
        {
            text: 'Logout', 
            onPress: () => onLogout(),
            style: 'destructive'
        },
    ]);
  }

  return (
    <ScreenWrapper bg="white">
      {/* first create UserHeader and use it here, then move it to header comp when implementing user posts */}
      {/* posts */}
      <FlatList
        data={feedItems}
        ListHeaderComponent={<UserHeader user={user} handleLogout={handleLogout} router={router} />}
        ListHeaderComponentStyle={{marginBottom: 30}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item: Micropost, index) => item.id.toString()}
        renderItem={({ item }) => <PostCard 
          item={item} 
          currentUser={user}
          router={router} 
        />}
        onEndReached={() => {
          getPosts();
          console.log('got to the end');
        }}
        onEndReachedThreshold={0} //  Specifies how close to the bottom the user must scroll before endreached is triggers, 0 -> 1
        ListFooterComponent={hasMore? (
            <View style={{marginTop: feedItems.length==0? 100: 30}}>
              <Loading />
            </View>
          ):(
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({user, handleLogout, router}: {user: any, handleLogout: () => void, router: any})=>{
  return (
    <View style={{flex: 1, backgroundColor:'white'}}> 
        <View>
          <Header 
            title="Profile" 
            mb={30} 
            onBackPress={() => router.back()} 
            rightComponent={null} 
          />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={26} color={theme.colors.rose} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.container}>
          <View style={{gap: 15}}>
            {/* avatar */}
            <View style={styles.avatarContainer}>
              <Avatar
                uri={user?.image}
                size={hp(12)}
                rounded={theme.radius.xxl*1.4}
              />
              {/* <Image source={getUserImageSrc(user?.image)} style={styles.avatar} /> */}
              <Pressable style={styles.editIcon} onPress={()=> router.push('/editProfile')}>
                <Icon name="edit" strokeWidth={2.5} size={20} />
              </Pressable>
            </View>
          

            {/* username & address */}
            <View style={{alignItems: 'center', gap: 4}}>
              <Text style={styles.userName}> { user && user.name } </Text>
              <Text style={styles.infoText}> {user && user.address} </Text>
            </View>

            {/* email, phone */}
            <View style={{gap: 10}}>
              
              <View style={styles.info}>
                <Icon name="mail" size={20} color={theme.colors.textLight} />
                <Text style={[styles.infoText, {fontSize: hp(1.8)}]}> 
                    {user && user.email}
                  </Text>
              </View>
              {
                user && user.phoneNumber && (
                  <View style={styles.info}>
                    <Icon name="call" size={20} color={theme.colors.textLight} />
                    <Text style={[styles.infoText, {fontSize: hp(1.8)}]}> 
                        {
                          user.phoneNumber
                        } 
                    </Text>
                  </View>
                )
              }
              
              {
                user && user.bio && (
                  <Text style={[styles.infoText]}>{user.bio}</Text>
                )
              }
              
            </View>
          </View>
          
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4), 
    marginBottom: 20
  },
  headerShape: {
    width: wp(100),
    height: hp(20)
  },  
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.textDark
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: theme.colors.textLight
  },

  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: '#fee2e2'
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,

  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  }

  
})

export default Profile