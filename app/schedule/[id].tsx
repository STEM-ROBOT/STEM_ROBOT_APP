import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Agenda, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

import { Stack } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import api from '@/config/config';
import { useLocalSearchParams, useSearchParams } from 'expo-router/build/hooks';
import EnterMatchCodeModal from '@/components/EnterMatchCodeModal';

interface TeamMatch {
  teamId: number;
  teamLogo: string;
  teamType: string | null;
}

interface ScheduleReferee {
  id: number;
  startTime: string;
  endTime: string;
  status: boolean;
  location: string;
  matchId: number;
  teamMatch: TeamMatch[];
}

const Schedule = () => {
  const {id} = useLocalSearchParams();

  const [scheduleReferee, setScheduleReferee] = useState<ScheduleReferee[]>([]);
  const [items, setItems] = useState<{ [key: string]: ScheduleReferee[] }>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const firstDate = scheduleReferee.length > 0
    ? scheduleReferee[0].startTime.split("T")[0]
    : new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(firstDate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/schedules/schedule-referee-sup?refereeCompetitionId=${id}`);
        const fetchedData = response.data.scheduleReferee;
        setScheduleReferee(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  // Filter matches for the selected date
  useEffect(() => {
    const filterMatchesByDate = () => {
      const filteredItems: { [key: string]: ScheduleReferee[] } = {};
      scheduleReferee.forEach((refereeSchedule) => {
        const date = refereeSchedule.startTime.split("T")[0];
        if (date === selectedDate) {
          if (!filteredItems[date]) {
            filteredItems[date] = [];
          }
          filteredItems[date].push(refereeSchedule);
        }
      });
      setItems(filteredItems);
    };

    filterMatchesByDate();
  }, [selectedDate, scheduleReferee]);

  const renderItem = (item: ScheduleReferee) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTime}>Thời gian: {item.startTime.split("T")[1]} - {item.endTime.split("T")[1]}</Text>
      <Text style={styles.itemRoom}>Sân: {item.location}</Text>
      <View style={styles.teamRow}>
        {item.teamMatch.map((team, index) => (
          <View key={index} style={styles.teamContainer}>
            <Image source={{ uri: team.teamLogo }} style={styles.teamLogo} />
            <Text style={styles.teamType}>{team.teamType}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => {
          const currentTime = new Date().getTime();
          const startTime = new Date(item.startTime).getTime();
          const endTime = new Date(item.endTime).getTime();
      
          if (currentTime < startTime) {
            Alert.alert("Thông báo", "Chưa đến giờ vào trận!");
            return;
          }
      
          if (currentTime > endTime) {
            Alert.alert("Thông báo", "Thời gian vào trận đã kết thúc!");
            return;
          }
          setSelectedMatchId(item.id);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Vào</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyDate = () => (
    <View style={styles.emptyDate}>
      <Text style={styles.noMatchText}>Không có lịch thi đấu</Text>
    </View>
  );

  const handleMatchCodeSubmit = (code: string) => {
    console.log("Submitted match code:", code);
    console.log("Match ID:", selectedMatchId);
  };

  const changeDay = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    const newDateString = current.toISOString().split('T')[0];
    setSelectedDate(newDateString);
  };

  return (
    <>
      <Stack.Screen
        options={{
        
          headerShown: true,
          title: "Lịch trình",
        }}
      />
      <View style={styles.container}>
        <View style={styles.dayNavigation}>
          <TouchableOpacity onPress={() => changeDay('prev')}>
            <Ionicons name="chevron-back" size={20} color="blue" />
          </TouchableOpacity>
          <Text style={styles.dayText}>{selectedDate}</Text>
          <TouchableOpacity onPress={() => changeDay('next')}>
            <Ionicons name="chevron-forward" size={20} color="blue" />
          </TouchableOpacity>
        </View>

        <Agenda
          items={items}
          renderItem={renderItem}
          renderEmptyDate={renderEmptyDate}
          selected={selectedDate}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          monthFormat={'MMMM yyyy'}
        />

        <EnterMatchCodeModal
          id={selectedMatchId}
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleMatchCodeSubmit}
        />
      </View>
    </>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemTime: { fontSize: 16, color: '#555' },
  itemRoom: { fontSize: 16, color: '#00B16A', fontWeight: 'bold', marginBottom: 10 },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  teamContainer: {
    alignItems: 'center',
    width: '45%',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  teamType: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  noMatchText: {
    fontSize: 16,
    color: '#888',
  },
  detailsButton: {
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});