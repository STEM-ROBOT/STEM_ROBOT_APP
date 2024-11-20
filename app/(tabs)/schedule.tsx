import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Agenda, Calendar } from 'react-native-calendars';

interface ScheduleItem {
  time: string;
  room: string;
  subject: string;
  sessionNo: number;
  group: string;
  lecturer: string;
}

const Schedule = () => {
  const initialItems = {
    '2024-10-10': [
      {
        time: '09:00 - 11:00',
        room: 'A.102',
        subject: 'MAT101',
        sessionNo: 5,
        group: 'MA24FA101',
        lecturer: 'JohnDoe',
      },
    ],
    '2024-11-26': [
      {
        time: '20:15 - 22:30',
        room: 'P.010',
        subject: 'SEP490',
        sessionNo: 13,
        group: 'FA24SE121_GFA64',
        lecturer: 'NgocTTM4',
      },
    ],
    '2024-12-05': [
      {
        time: '14:00 - 16:00',
        room: 'B.203',
        subject: 'PHY202',
        sessionNo: 8,
        group: 'PH24WI202',
        lecturer: 'JaneSmith',
      },
    ],
    '2024-12-20': [
      {
        time: '10:00 - 12:00',
        room: 'C.301',
        subject: 'CHE303',
        sessionNo: 10,
        group: 'CH24SP303',
        lecturer: 'EmilyClark',
      },
    ],
    '2024-12-21': [
      {
        time: '10:00 - 12:00',
        room: 'C.301',
        subject: 'CHE303',
        sessionNo: 10,
        group: 'CH24SP303',
        lecturer: 'EmilyClark',
      },
    ],
  };

  const [items, setItems] = useState(initialItems);
  const [selectedDate, setSelectedDate] = useState('2024-11-26');

  const renderItem = (item: ScheduleItem) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTime}>{item.time}</Text>
        <Text style={styles.itemRoom}>Room: {item.room}</Text>
        <Text style={styles.itemSubject}>Subject Code: {item.subject}</Text>
        <Text style={styles.itemDetails}>Session No: {item.sessionNo}</Text>
        <Text style={styles.itemDetails}>Group class: {item.group}</Text>
        <Text style={styles.itemLecturer}>Lecturer: {item.lecturer}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Materials</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Meet URL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    // const filteredItems: { [key: string]: ScheduleItem[] } = {};
    // if (initialItems[day.dateString]) {
    //     filteredItems[day.dateString] = initialItems[day.dateString];
    // }
    
    // setItems(filteredItems);
};

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />

      {/* Agenda View */}
      <Agenda
        items={items}
        renderItem={renderItem}
        selected={selectedDate}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>No events</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemTime: { fontSize: 16, color: '#555' },
  itemRoom: { fontSize: 16, color: '#00B16A', fontWeight: 'bold' },
  itemSubject: { fontSize: 16, color: '#00B16A', fontWeight: 'bold' },
  itemDetails: { fontSize: 14, color: '#555' },
  itemLecturer: { fontSize: 14, color: '#555', marginBottom: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#E5E5E5',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#555',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyDate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
});
