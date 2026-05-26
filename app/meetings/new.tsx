// meetings/new.tsx → meetings/[id].tsx with id='new' 재사용
import { Redirect } from 'expo-router';

export default function NewMeetingScreen() {
  return <Redirect href="/meetings/new-entry" />;
}
