import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import api from '@/config/config';
import connectHub from '@/config/connectHub'
import { HubConnection } from '@microsoft/signalr';
import { Stack, useLocalSearchParams } from 'expo-router';

type MatchRouteParams = {
    match: {
        matchId: number;
    };
};
interface ResultData {
    id: number;
    teamName: string;
    teamImage: string;
    tolalScore: number;
}

interface MatchData {
    score: Array<{
        scoreId: number;
        description: string;
        type: string;
        point: string;
    }>;
    matchInfo: {
        matchId: number;
        startTime: string;
        endTime: string;
        durationHaft: string;
        breakHaftTime: string;
        haftMatch: Array<{ haftId: number; haftName: string }>;
        teamMatch: Array<{ teamMatchId: number; teamName: string; teamLogo: string }>;
    };
}

interface Action {
    id: number;
    scoreCategoryId: number;
    scoreCategoryDescription: string;
    scoreCategoryPoint: number;
    scoreCategoryType: string;
    eventTime: string;
    teamMatchId: number;
    teamName: string;
    teamLogo: string; // Added
    refereeCompetitionId: number;
    status: string;
    haftName: string; // Added
}


const Match = () => {
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState("1st Half");
    const [elapsedTime, setElapsedTime] = useState("00:00:00");
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<'positive' | 'negative'>('positive');
    const hubConnectionRef = useRef(null);
    const hubConnectionResultRef = useRef<HubConnection | null>(null);
    const hubConnectionActionRef = useRef<HubConnection | null>(null);
    const [teamMatchResult, setTeamMatchResult] = useState<ResultData[]>([]);
    const [listActionResult, setListActionResult] = useState<Action[]>([]);
    const [loadApiConnectClient, setLoadApiConnectClient] = useState(true);

    const previousDataRef = useRef<any[] | null>(null);
    const previousResultDataRef = useRef<ResultData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/schedules/schedule-referee-sup-match-info?scheduleId=${id}`);

                const fetchedData = response.data;
                const mappedData: MatchData = {
                    score: fetchedData.score.map((score: any) => ({
                        scoreId: score.scoreId,
                        description: score.description,
                        type: score.type,
                        point: score.point,
                    })),
                    matchInfo: {
                        matchId: fetchedData.matchInfo.matchId,
                        startTime: fetchedData.matchInfo.startTime,
                        endTime: fetchedData.matchInfo.endTime,
                        durationHaft: fetchedData.matchInfo.durationHaft,
                        breakHaftTime: fetchedData.matchInfo.breakHaftTime,
                        haftMatch: fetchedData.matchInfo.haftMatch.map((haft: any) => ({
                            haftId: haft.haftId,
                            haftName: haft.haftName,
                        })),
                        teamMatch: fetchedData.matchInfo.teamMatch.map((team: any) => ({
                            teamMatchId: team.teamMatchId,
                            teamName: team.teamName,
                            teamLogo: team.teamLogo,
                        })),
                    },
                };
                console.log(mappedData)
                setMatchData(mappedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching match data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const handleResultData = (data: ResultData[]) => {
            // console.log("rs", data)
            let mapdata: ResultData[] =
                data.map((item: any) => ({
                    id: item.id,
                    teamName: item.teamName,
                    teamImage: item.teamImage,
                    tolalScore: item.tolalScore,
                }));
            setTeamMatchResult(mapdata);
        };

        const handleActionData = (data: Action[]) => {
            // console.log("Received Data:", data);

            if (Array.isArray(data)) {
                let mappedActions: Action[] = data.map((action) => ({
                    id: action.id,
                    scoreCategoryId: action.scoreCategoryId,
                    scoreCategoryDescription: action.scoreCategoryDescription,
                    scoreCategoryPoint: action.scoreCategoryPoint,
                    scoreCategoryType: action.scoreCategoryType,
                    eventTime: action.eventTime,
                    status: action.status,
                    refereeCompetitionId: action.refereeCompetitionId,
                    teamMatchId: action.teamMatchId,
                    teamName: action.teamName,
                    teamLogo: action.teamLogo,
                    haftName: action.haftName,
                }));
                setListActionResult(mappedActions);
            } else {
                console.error("Invalid Action data:", data);
            }
        };



        const connectHubClient = async () => {
            setLoadApiConnectClient(false);


            connectHub({
                client: `team-match-result/${matchData?.matchInfo.matchId}`,
                onDataReceived: handleResultData,
            }).then((hubConnection) => {
                hubConnectionResultRef.current = hubConnection;
            });


            connectHub({
                client: `list-action-refere-sub/${id}`,
                onDataReceived: handleActionData,
            }).then((actionHubConnection) => {
                hubConnectionActionRef.current = actionHubConnection;
            });


        };

        const connectClient = () => {
            setLoadApiConnectClient(false);
            api
                .get(`/api/matches/match-total-point?matchId=${matchData?.matchInfo.matchId}`)
                .then((response) => {
                    if (response.data === "timeout") {
                        if (hubConnectionResultRef.current) {
                            hubConnectionResultRef.current.stop();
                            hubConnectionResultRef.current = null;
                        }
                    } else if (
                        response.data !== "notstarted" &&
                        Array.isArray(response.data) &&
                        response.data.length > 0
                    ) {
                        setTeamMatchResult(response.data);
                        previousDataRef.current = response.data;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            api
                .get(`/api/actions/referee-sup-action?scheduleId=${id}`)
                .then((response) => {
                    if (response.data === "timeout") {
                        if (hubConnectionActionRef.current) {
                            hubConnectionActionRef.current.stop();
                            hubConnectionActionRef.current = null;
                        }
                    } else if (
                        response.data !== "notstarted" &&
                        response.data
                    ) {
                        setListActionResult(response.data);
                        // previousDataRef.current = response.data;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        if (loadApiConnectClient && matchData) {
            connectHubClient();
            connectClient();
        }
        return () => {
            if (hubConnectionResultRef.current) {
                hubConnectionResultRef.current.stop();
                hubConnectionResultRef.current = null;
            }
            if (hubConnectionActionRef.current) {
                hubConnectionActionRef.current.stop();
                hubConnectionActionRef.current = null;
            }
        };
    }, [matchData?.matchInfo.matchId, loadApiConnectClient]);

    // console.log("listActionResult",listActionResult)

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    const timeToSeconds = (time: string): number => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };


    useEffect(() => {
        if (!matchData) return;

        const haftDurationSeconds = timeToSeconds(matchData.matchInfo.durationHaft);
        const breakDurationSeconds = parseInt(matchData.matchInfo.breakHaftTime, 10) * 60; // Thời gian nghỉ giữa hiệp
        const totalMatchSeconds =
            matchData.matchInfo.haftMatch.length * haftDurationSeconds +
            (matchData.matchInfo.haftMatch.length - 1) * breakDurationSeconds; // Tổng thời gian trận đấu

        const startTime = new Date(`${currentDate}T${matchData.matchInfo.startTime}`).getTime();
        const currentTime = Date.now();

        // Nếu trận đấu chưa bắt đầu
        if (currentTime < startTime) {
            setPhase("Chưa bắt đầu");
            setElapsedTime("00:00");
            setProgress(0); // ProgressBar ở mức 0
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);

            if (elapsedSeconds >= totalMatchSeconds) {
                setPhase("Hết giờ");
                setProgress(1); // Hoàn thành ProgressBar
                setElapsedTime("Hết giờ");
                clearInterval(interval);
                return;
            }

            // Tính toán thời gian đã trôi qua
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            setElapsedTime(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);

            // Xác định trạng thái hiện tại: hiệp hoặc nghỉ
            let currentPhase = "Hết giờ";
            for (let i = 0; i < matchData.matchInfo.haftMatch.length; i++) {
                const phaseStart = i * (haftDurationSeconds + breakDurationSeconds);
                const phaseEnd = phaseStart + haftDurationSeconds;

                if (elapsedSeconds >= phaseStart && elapsedSeconds < phaseEnd) {
                    currentPhase = `Hiệp ${matchData.matchInfo.haftMatch[i].haftName}`; // Hiển thị "Hiệp" trước tên hiệp
                    break;
                } else if (elapsedSeconds >= phaseEnd && elapsedSeconds < phaseEnd + breakDurationSeconds) {
                    currentPhase = "Thời gian nghỉ"; // Nghỉ giữa hiệp
                    break;
                }
            }

            setPhase(currentPhase);

            // Cập nhật tiến trình ProgressBar
            const currentProgress = Math.min(elapsedSeconds / totalMatchSeconds, 1); // Giới hạn progress trong [0, 1]
            setProgress(Number(currentProgress.toFixed(2))); // Giới hạn độ chính xác
        }, 1000);

        return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }, [matchData, currentDate]);



    const handleEventClick = async (scoreId: number, teamId: number) => {
        try {
            if (!matchData) {
                console.error('matchData is null or undefined');
                return;
            }

            const startTimeString = `${currentDate}T${matchData.matchInfo.startTime}`;
            const startTime = new Date(startTimeString).getTime();
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(elapsedSeconds % 60).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            const matchHalfId =
                matchData.matchInfo.haftMatch.find(
                    (half) => `Hiệp ${half.haftName}` === phase
                )?.haftId || 0;

            if (matchHalfId === 0) {
                Alert.alert("Thông báo", "Không thể gửi!");
                return;              
            }
            const requestData = {
                eventTime: formattedTime,
                matchHalfId: matchHalfId,
                scoreCategoryId: scoreId,
                teamMatchId: teamId,
                scheduleId: id,
            };
            console.log(requestData)
            const response = await api.post('/api/actions/send-action', requestData);
        } catch (error) {
            console.error('Error handling event click:', error);
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (!matchData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không có dữ liệu trận đấu</Text>
            </View>
        );
    }
    // console.log(teamMatchResult)
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Lịch trình",
                }}
            />
            <ScrollView style={styles.container}>
                {/* Match Header */}
                {
                    teamMatchResult.length >= 2 && (
                        <View style={styles.headerContainer}>
                            <View style={styles.teamContainer}>
                                <Image source={{ uri: teamMatchResult[0].teamImage }} style={styles.teamLogo} />
                                <Text style={styles.teamName}>{teamMatchResult[0].teamName}</Text>
                                <Text style={styles.teamScore}>
                                    {teamMatchResult[0].tolalScore}
                                </Text>
                            </View>
                            <View style={styles.teamContainer}>
                                <Image source={{ uri: teamMatchResult[1].teamImage }} style={styles.teamLogo} />
                                <Text style={styles.teamName}>{teamMatchResult[1].teamName}</Text>
                                <Text style={styles.teamScore}>
                                    {teamMatchResult[1].tolalScore}
                                </Text>
                            </View>
                        </View>
                    )
                }

                {/* Progress Bar with Elapsed Time */}
                <View style={styles.progressContainer}>
                    <Text style={styles.elapsedTimeText}>{phase === "Chưa bắt đầu" ? "00:00" : elapsedTime}</Text>
                    <View style={styles.customProgressBarContainer}>
                        <View style={[styles.customProgressBar, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.phaseText}>{phase}</Text>
                </View>
                {listActionResult.length > 0 && (

                    <ScrollView style={styles.scrollContainerReport}>
                        {listActionResult.map((report) => (
                            <View key={report.id} style={styles.reportContainer}>
                                <Image source={{ uri: report.teamLogo }} style={styles.reportImage} />
                                <View style={styles.reportContent}>
                                    <Text style={styles.reportText}> {report.teamName} - {report.scoreCategoryDescription} - Hiệp: {report.haftName}</Text>

                                    <View style={styles.statusContainer}>
                                        <Text
                                            style={[
                                                styles.statusText,
                                                report.status === "pending"
                                                    ? styles.statusProcessing
                                                    : report.status === "accept"
                                                        ? styles.statusConfirmed
                                                        : styles.statusRejected,
                                            ]}
                                        >
                                            {report.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Toggle Buttons */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, selectedFilter === 'positive' && styles.activeButton]}
                        onPress={() => setSelectedFilter('positive')}
                    >
                        <Text style={[styles.toggleText, selectedFilter === 'positive' && styles.activeText]}>Điểm cộng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, selectedFilter === 'negative' && styles.activeButton]}
                        onPress={() => setSelectedFilter('negative')}
                    >
                        <Text style={[styles.toggleText, selectedFilter === 'negative' && styles.activeText]}>Điểm trừ</Text>
                    </TouchableOpacity>
                </View>

                {/* Event Timeline Section */}


                <View style={styles.sectionContainer}>

                    <ScrollView style={styles.scrollContainer}>
                        {matchData.score
                            .filter((event) => {
                                // Check if the event type matches the selected filter
                                if (selectedFilter === 'positive') {
                                    return event.type === "Điểm cộng"; // Show only Điểm cộng
                                } else if (selectedFilter === 'negative') {
                                    return event.type === "Điểm trừ"; // Show only Điểm trừ
                                }
                                return true; // Default case, shows all events (optional)
                            })
                            .map((event) => (
                                <View key={event.scoreId} style={styles.eventContainer}>


                                    <View
                                        style={[
                                            styles.eventIndicator,
                                            { backgroundColor: event.type === "Điểm trừ" ? 'red' : '#4CAF50' },
                                        ]}
                                    />
                                    <View style={styles.eventDetails}>
                                        <Text style={styles.eventText}>{event.description}</Text>
                                        <Text
                                            style={[
                                                styles.eventPoint,
                                                { color: event.type === "Điểm trừ" ? 'red' : 'green' } // Dynamic color based on event type
                                            ]}
                                        >
                                            {event.type}: {event.point} điểm
                                        </Text>
                                    </View>

                                    <View style={styles.teamContainer}>
                                        <TouchableOpacity
                                            onPress={() => handleEventClick(event.scoreId, matchData.matchInfo.teamMatch[0].teamMatchId)}
                                        >
                                            <Image
                                                source={{ uri: matchData.matchInfo.teamMatch[0].teamLogo }}
                                                style={styles.teamLogoSmall}
                                            />
                                            <Text style={styles.teamNameSmall}>
                                                {matchData.matchInfo.teamMatch[0].teamName}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.teamContainer}>
                                        <TouchableOpacity
                                            onPress={() => handleEventClick(event.scoreId, matchData.matchInfo.teamMatch[1].teamMatchId)}
                                        >
                                            <Image
                                                source={{ uri: matchData.matchInfo.teamMatch[1].teamLogo }}
                                                style={styles.teamLogoSmall}
                                            />
                                            <Text style={styles.teamNameSmall}>
                                                {matchData.matchInfo.teamMatch[1].teamName}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                    </ScrollView>
                </View>

            </ScrollView>

        </>

    );
};

export default Match;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    teamScore: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#4CAF50' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    teamContainer: { alignItems: 'center', width: 80 },
    teamLogo: { width: 50, height: 50, borderRadius: 25 },
    teamName: { fontSize: 14, color: '#333', marginTop: 5, textAlign: 'center' },
    scoreContainer: { alignItems: 'center' },
    scoreText: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    timeText: { fontSize: 14, color: '#777' },
    progressContainer: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    elapsedTimeText: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 5 },
    phaseText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
    progressBar: { height: 10, borderRadius: 5 },
    toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, backgroundColor: '#fff' },
    toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
    activeButton: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    toggleText: { fontSize: 14, color: '#333' },
    activeText: { color: '#fff', fontWeight: 'bold' },
    sectionContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    eventContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        paddingBottom: 15, // Optional for spacing
        borderBottomWidth: 1, // Thickness of the border
        borderBottomColor: '#ccc', // Color of the border
    },
    eventIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 10 },
    eventText: { fontSize: 14, color: '#333' },
    reportContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1, // Add bottom border
        borderBottomColor: '#ccc', // Color for the border
    },
    reportImage: { width: 50, height: 30, resizeMode: 'contain', marginRight: 10 },
    reportText: { fontSize: 16, color: '#333' },
    eventDetails: {
        flex: 1,
        paddingLeft: 10,
    },
    eventPoint: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    teamLogoSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
    },
    teamNameSmall: {
        fontSize: 12,
        color: '#555',
        marginTop: 5,
        textAlign: 'center',
    },
    scrollContainer: {
        maxHeight: 350,
        marginTop: 10,
    },
    scrollContainerReport: {
        maxHeight: 220,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    statusProcessing: {
        color: "orange", // Màu vàng cho Đang xử lý
    },
    statusConfirmed: {
        color: "green", // Màu xanh cho Xác nhận
    },
    statusRejected: {
        color: "red", // Màu đỏ cho Từ chối
    },
    reportContent: {
        flex: 1,
        marginLeft: 10,
    },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    customProgressBarContainer: {
        height: 10,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginVertical: 10,
    },
    customProgressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
});
