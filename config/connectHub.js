import {
    HttpTransportType,
    HubConnection,
    HubConnectionBuilder,
  } from "@microsoft/signalr";
  
  const _hub = "http://157.66.27.69:5000/stem-hub";
  
const connectHub = async ({ client, onDataReceived }) => {
   
  
    const hubConnection = new HubConnectionBuilder()
      .withUrl(_hub, {
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();
  
    hubConnection.on(client, (data) => {
      if (onDataReceived) {
        onDataReceived(data);
      }
    });
  
    try {
      await hubConnection.start();
      console.log("Connected to SignalR hub");
      return hubConnection;
      // setConnection(hubConnection);
    } catch (error) {
      console.log("Connection failed: ", error);
      return null;
    }
  };
  export default connectHub;
  