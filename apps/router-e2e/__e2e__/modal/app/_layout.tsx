import { Link, Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="formsheet"
        options={{
          headerLeft: () => (
            <Link href="../">Go Back</Link>
          ),
          headerShown: true,
          presentation: 'modal',
          title: 'Formsheet Demos',
        }}/>
    </Stack>
  );
}
