import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { fetchTokens } from '@service/BookingProvider';
import { appAxios } from '@service/apiInterceptors';
import { Alert } from 'react-native';


interface Appointment {
  _id: string;
  token_id: string;
  user_id: {
    _id: string;
    name: string;
    phone: string;
  };
  issued_at: string;
  queue_date: string;
  status: 'completed';
}

const Content = () => {

  const [selectedDate, setSelectedDate] = useState(moment());
  const [days, setDays] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifiedTokens, setNotifiedTokens] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateDays();
    loadTokens(selectedDate);
  }, [selectedDate]); // Refetch when date changes

  const loadTokens = async (date: any) => {
    setIsLoading(true);
    const dateString = moment(date).format('YYYY-MM-DD');
    const data = await fetchTokens(dateString);
    console.log(data)
    if (data && data.tokens) {
      setAppointments(data.tokens);
    } else {
      setAppointments([]);
    }
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTokens(selectedDate);
    setRefreshing(false);
  };

  // No client-side filtering needed anymore as backend handles it

  const generateDays = () => {
    const today = moment();
    const newDays = [];
    // Generate 7 days back and 7 days forward
    for (let i = -7; i <= 7; i++) {
      const day = today.clone().add(i, 'days');
      newDays.push({
        date: day,
        dayName: day.format('ddd'), // Mon, Tue
        dayNumber: day.format('DD'), // 09, 10
        fullDate: day.format('YYYY-MM-DD'),
        // Show dot only for today
        hasEvent: day.isSame(moment(), 'day'),
      });
    }
    setDays(newDays);
  };


  const renderCalendarItem = ({ item }: { item: any }) => {
    const isSelected = item.fullDate === selectedDate.format('YYYY-MM-DD');
    return (
      <TouchableOpacity
        style={styles.dayContainer}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text style={[styles.dayName, isSelected && styles.selectedDayName]}>
          {item.dayName}
        </Text>
        <View style={[styles.dateBubble, isSelected && styles.selectedDateBubble]}>
          <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
            {item.dayNumber}
          </Text>
        </View>
        {item.hasEvent && !isSelected && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  const renderCalendarStrip = () => {

    return (
      <View style={styles.calendarStrip}>
        <FlatList
          data={days}
          renderItem={renderCalendarItem}
          keyExtractor={(item) => item.fullDate}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {

    return (
      <View style={styles.card}>
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenValue}>{item.token_id}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.userValue}>{item.user_id?.name || "Customer"}</Text>
          <Text style={styles.userSubValue}>{item.user_id?.phone}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.timeRight}>{moment(item.issued_at).format("h:mm A")}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>


      <View style={styles.calendarWrapper}>
        {renderCalendarStrip()}
      </View>


      <View style={styles.listContainer}>
        <FlatList
          data={appointments} // Use appointments directly
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContent}
          extraData={selectedDate}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tokens yet</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarWrapper: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  calendarStrip: {
    paddingVertical: 10,

  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 5,
  },
  dayName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  selectedDayName: {
    color: '#000',
  },
  dateBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed', // Reference image style
    backgroundColor: 'transparent',
  },
  selectedDateBubble: {
    backgroundColor: '#000', // Black filled for selected
    borderColor: '#000',
    borderStyle: 'solid',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 70,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  tokenContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6', // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tokenLabel: {
    display: 'none', // Hide label as per user edit/intent
  },
  tokenValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  userTitle: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  userValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 4
  },
  userSubValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  timeRight: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8
  },
  notifyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6', // Primary Blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  notifyText: {
    display: 'none'
  },
  chevronContainer: {
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default Content;