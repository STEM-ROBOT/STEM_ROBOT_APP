import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import api from '@/config/config';
import { NavigationProp } from '@react-navigation/native';
import tokenService from '@/config/tokenservice';

export type RootStackParamList = {
  home: undefined;
  schedule: { id: number };
  match: { matchId: number };
  login: undefined;
};
interface RefereeInfo {
  image: string;
  name: string;
  role: string;
}

interface CompetitionItem {
  id: number;
  image: string;
  competitionName: string;
  tournamentName: string;
  location: string;
}

const Page = () => {

  const router = useRouter();
  const [competitionData, setCompetitionData] = useState<{
    infoReferee: RefereeInfo;
    competitions: CompetitionItem[];
  }>({
    infoReferee: {
      image: '',
      name: '',
      role: '',
    },
    competitions: [],
  });

  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/referees/referee-sup-tournament');
        const fetchedData = response.data.data;

        setCompetitionData({
          infoReferee: {
            image: fetchedData.infoReferee.image,
            name: fetchedData.infoReferee.name,
            role: fetchedData.infoReferee.role,
          },
          competitions: fetchedData.competitions.map((item: CompetitionItem) => ({
            id: item.id,
            image: item.image,
            competitionName: item.competitionName,
            tournamentName: item.tournamentName,
            location: item.location,
          })),
        });
      } catch (error) {
        tokenService.removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleLogout = () => {
    tokenService.removeToken();
    router.push('/login');
  };

  const renderCompetitionItem = ({ item }: { item: CompetitionItem }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: "/schedule/[id]", params: { id: item.id } })}>
      <View style={styles.optionContainer}>
        <Image source={{ uri: item.image }} style={styles.optionImage} />
        <View style={styles.textContainer}>
          <Text style={styles.optionText}>{item.competitionName}</Text>
          <Text style={styles.subtitle}>{item.tournamentName}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="gray" style={styles.optionIcon} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0E2F24" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{

          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
          {menuVisible && (
            <View style={styles.menu}>
              <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                <Text style={styles.menuText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.profileContainer}>
          <Image source={{ uri: competitionData.infoReferee.image }} style={styles.profileImage} />
          <Text style={styles.userName}>{competitionData.infoReferee.name}</Text>
          <Text style={styles.userContact}>{competitionData.infoReferee.role}</Text>
        </View>

        <View style={styles.accountOverview}>
          <Text style={styles.accountOverviewTitle}>Nội dung thi đấu</Text>

          <FlatList
            data={competitionData.competitions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCompetitionItem}
            contentContainerStyle={styles.listContentContainer}
          />
        </View>
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
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
  menu: {
    position: 'absolute',
    top: 60, // Điều chỉnh để menu nằm dưới icon
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000, // Đảm bảo hiển thị phía trên các thành phần khác
  },
  menuItem: {
    padding: 15,
    // borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },

});
