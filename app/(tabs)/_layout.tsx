import { Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Colors from '@/constants/Colors'
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: Colors.bgColor,
                    borderTopWidth: 0,
                    padding: 0
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.black,
                tabBarInactiveTintColor: '#999'
            }}>
            <Tabs.Screen name='index' options={{
                tabBarIcon: ({ color }) => (
                    <FontAwesome name='user' size={28} color={color} />
                )
            }} />
            {/* <Tabs.Screen name='schedule' options={{
                tabBarIcon: ({ color }) => (
                    <MaterialIcons name='space-dashboard' size={28} color={color} />
                )
            }} /> */}
        </Tabs>
    )

}

