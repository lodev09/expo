import { Link, ModalContextProvider, Stack } from 'expo-router';

export default function Layout() {
  return (
    <ModalContextProvider>
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
    </ModalContextProvider>
  );
}
