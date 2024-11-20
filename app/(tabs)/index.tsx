import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useNavigation } from 'expo-router';

interface CompetitionItem {
  id: number;
  image: string;
  competitionName: string;
  tournamentName: string;
  location: string;
}

const Page = () => {
  const navigation = useNavigation();
  const infoReferee = {
    image: "https://ephoto360.com/uploads/w450/2018/08/16/logo-avat-min5b7543d71cf6d_14dfbfa7e7fd2d65c95470c8cd01c651.jpg",
    name: "Lê Đình Thành",
    role: "Trọng tài viên"
  };

  const competitionData = [
    {
      id: 1,
      image: "https://ephoto360.com/uploads/w450/2018/08/16/logo-avat-min5b7543d71cf6d_14dfbfa7e7fd2d65c95470c8cd01c651.jpg",
      competitionName: 'Robot Speed Challenge',
      tournamentName: 'National Robotics Championship 2024',
      location: 'Hanoi, Vietnam'
    },
    {
      id: 2,
      image: "https://ephoto360.com/uploads/w450/2018/08/16/logo-avat-min5b7543d71cf6d_14dfbfa7e7fd2d65c95470c8cd01c651.jpg",
      competitionName: 'Maze Solving Competition',
      tournamentName: 'Asia STEM Expo 2024',
      location: 'Bangkok, Thailand'
    },
    // Add more items as needed
  ];

  const renderCompetitionItem = ({ item }: { item: CompetitionItem }) => (
    <TouchableOpacity onPress={() => navigation.navigate('schedule' as never)}>
      <View style={styles.optionContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.optionImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.optionText}>{item.competitionName}</Text>
          <Text style={styles.subtitle}>{item.tournamentName}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="gray" style={styles.optionIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={{ uri: infoReferee.image }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{infoReferee.name}</Text>
          <Text style={styles.userContact}>{infoReferee.role}</Text>
        </View>

        <View style={styles.accountOverview}>
          <Text style={styles.accountOverviewTitle}>Nội dung thi đấu</Text>

          <FlatList
            data={competitionData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCompetitionItem}
            contentContainerStyle={styles.listContentContainer}
          />
        </View>
      </View>
    </>
  );
}

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  header: {
    backgroundColor: '#0E2F24',
    padding: 20,
    paddingTop: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    position: 'relative',
  },
  menuIcon: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  userContact: {
    color: '#6B6B6B',
    marginBottom: 20,
  },
  accountOverview: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    flex: 1,
    marginBottom:20
  },
  accountOverviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  optionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  location: {
    fontSize: 14,
    color: '#9A9A9A',
  },
  optionIcon: {
    marginLeft: 'auto',
  },
});
