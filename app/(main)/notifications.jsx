import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import { fetchNotifications } from '../../services/notificationService'
import { useAuth } from '../../contexts/AuthContext'
import NotificationItem from '../../components/NotificationItem'
import { theme } from '../../constants/theme'
import { useRouter } from 'expo-router'
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from '../../redux/session/sessionSlice'       

const Notifications = () => {

  const [notifications, setNotifications] = useState([]);
  const current_user = useAppSelector(selectUser)
  const router = useRouter();

  useEffect(()=>{
    getNotifications();
  },[]);

  const getNotifications = async ()=>{
    // let res = await fetchNotifications(current_user.id);
    if(res.success) setNotifications([{'id': 1, 'message': 'You have a new message', 'created_at': '2023-10-01T12:00:00Z', 'senderId': {'id': 1, 'name': 'John Doe', 'image': ''}}]);
  }
  return (
    <ScreenWrapper >
      <View style={styles.container}>
        <Header title="Notifications" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item=>{
              return (
                <NotificationItem 
                  key={item.id}
                  item={item} 
                  router={router}
                />
              )
            })
          }
          {
            notifications.length==0 && (
              <Text style={styles.noData}>No notifications yet</Text>
            )
          }
        </ScrollView>
      </View>
      
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  }
})
export default Notifications