import {
    HttpTransportType,
    HubConnection,
    HubConnectionBuilder,
  } from "@microsoft/signalr";
  
  const _hub = "http://157.66.27.69:5000/stem-hub"
  
  export const connectHub = async ({ client, onDataReceived }) => {
    console.log("Client:", client);
  
    const hubConnection = new HubConnectionBuilder()
      .withUrl(_hub, {
        transport: HttpTransportType.WebSockets, // WebSocket is suitable for React Native
      })
      .withAutomaticReconnect() // Automatically reconnect if the connection is lost
      .build();
  
    hubConnection.on(client, (data) => {
      if (onDataReceived) {
        onDataReceived(data);
      }
    });
  
    try {
      await hubConnection.start();
      console.log("Connected to SignalR hub");
      return hubConnection; // Return the connection instance
    } catch (error) {
      console.error("Connection to SignalR hub failed:", error);
      return null;
    }
  };
  
  export default connectHub;
  