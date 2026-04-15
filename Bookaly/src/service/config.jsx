import { Platform } from "react-native";

// export const BASE_URL = Platform.OS === "android" ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api'
// export const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'


// YOUR NETWORK IP OR HOSTED URL

// const LAN_IP = '15.207.99.187'

// const LAN_IP = '192.168.26.177'
// const PORT = '3000'

// export const BASE_URL = `http://${LAN_IP}:${PORT}/api`
// export const SOCKET_URL = `http://${LAN_IP}:${PORT}`

export const BASE_URL = 'http://bookaly-backend-alb-1911328299.ap-south-1.elb.amazonaws.com/api'
export const SOCKET_URL = 'http://bookaly-backend-alb-1911328299.ap-south-1.elb.amazonaws.com'
