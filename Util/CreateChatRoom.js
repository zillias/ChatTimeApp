const createChatRoomName = (person1, person2) => {
  const chatRoom = [person1, person2].sort();
  return chatRoom[0] + chatRoom[1];
};

export default createChatRoomName;
