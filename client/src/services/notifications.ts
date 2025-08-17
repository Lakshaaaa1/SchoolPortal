import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
// Try to import FCM if available
let FCM: any = undefined;
try {
  // Dynamically import FCM if installed
  FCM = require('@capacitor-community/fcm').FCM;
} catch (e) {
  // FCM not installed or not available
  FCM = undefined;
}
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

export interface NotificationSetupParams {
  studentId: string;
  className: string;
  section?: string;
}

let notificationsInitialized = false;

export async function setupNotifications({ studentId, className, section }: NotificationSetupParams) {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native platforms');
    return;
  }

  // Prevent duplicate initialization
  if (notificationsInitialized) {
    console.log('Notifications already initialized');
    return;
  }

  // --- Create Android notification channel for announcements ---
  if (Capacitor.getPlatform() === 'android') {
    try {
      if (FCM && FCM.createChannel) {
        // Use Capacitor FCM plugin if available
        await FCM.createChannel({
          id: 'announcements',
          name: 'Announcements',
          importance: 4, // 4 = high
          sound: 'default',
          visibility: 1, // 1 = public
          description: 'Channel for important announcements'
        });
        console.log('Android notification channel "announcements" created via FCM');
      } else if (PushNotifications.createChannel) {
        // Fallback: Use PushNotifications plugin if it supports createChannel
        await PushNotifications.createChannel({
          id: 'announcements',
          name: 'Announcements',
          importance: 4,
          sound: 'default',
          description: 'Channel for important announcements'
        });
        console.log('Android notification channel "announcements" created via PushNotifications');
      } else {
        console.warn('No API available to create Android notification channel. Please ensure FCM or PushNotifications plugin supports channel creation.');
      }
    } catch (err) {
      console.error('Failed to create Android notification channel:', err);
    }
  }

  try {
    console.log('Setting up push notifications for student:', studentId);

    // Request permission to use push notifications
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive === 'granted') {
      console.log('Push notification permission granted');
      
  // Register with Apple / Google to receive push via APNS/FCM
  await PushNotifications.register();

  // Add listeners for push notification events
  setupNotificationListeners(studentId, className, section);

  notificationsInitialized = true;
  console.log('Push notifications setup completed');
    } else {
      console.log('Push notification permission denied');
    }
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
}

function setupNotificationListeners(studentId: string, className: string, section?: string) {
  // Called when a new push notification is received (app in foreground)
  PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
    console.log('Push notification received (foreground):', notification);
    
    // Show in-app notification using local notifications
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || 'New Notification',
            body: notification.body || 'You have a new message',
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            channelId: 'announcements', // Ensure it uses the correct channel
            attachments: undefined,
            actionTypeId: '',
            extra: notification.data
          }
        ]
      });
      
      console.log('Local notification scheduled for foreground notification');
    } catch (error) {
      console.error('Error showing local notification:', error);
      
      // Fallback: Store notification for display in app
      const notificationData = {
        title: notification.title || 'New Notification',
        body: notification.body || 'You have a new message',
        timestamp: new Date().toISOString(),
        data: notification.data
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('pendingInAppNotifications') || '[]');
      existingNotifications.push(notificationData);
      localStorage.setItem('pendingInAppNotifications', JSON.stringify(existingNotifications));
    }
  });

  // Called when a push notification is opened (app in background/closed)
  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    console.log('Push notification action performed:', action);
    
    // Log the action for future navigation handling
    const notificationData = {
      action: action.actionId,
      notification: action.notification,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for app to handle on next launch
    const existingActions = JSON.parse(localStorage.getItem('pendingNotificationActions') || '[]');
    existingActions.push(notificationData);
    localStorage.setItem('pendingNotificationActions', JSON.stringify(existingActions));
  });

  // Called when the device receives a registration token
  PushNotifications.addListener('registration', async (token) => {
    console.log('Registration token received:', token.value);
    try {
      // Check if studentId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let resolvedStudentId = studentId;
      if (!uuidRegex.test(studentId)) {
        // Lookup by login_id or name
        const { data, error } = await supabase
          .from('students')
          .select('id')
          .or(`login_id.eq.${studentId},name.eq.${studentId}`)
          .maybeSingle();
        if (error) {
          console.error('Error looking up student UUID:', error);
          return;
        }
        if (!data || !data.id) {
          console.error('No student found for identifier:', studentId);
          return;
        }
        resolvedStudentId = data.id;
      }
      // Save or update the FCM token in Supabase using the resolved UUID
      await saveTokenToDatabase(resolvedStudentId, className, section, token.value);
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  });

  // Called when there is an error during registration
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Registration error:', error);
  });
}

async function saveTokenToDatabase(studentId: string, className: string, section: string | undefined, fcmToken: string) {
  try {
    console.log('Saving FCM token to database for student:', studentId);
    
    // Check if a token already exists for this student
    const { data: existingToken, error: fetchError } = await supabase
      .from('student_tokens')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError;
    }

    const tokenData = {
      student_id: studentId,
      class: className,
      section: section || null,
      fcm_token: fcmToken,
      updated_at: new Date().toISOString()
    };

    if (existingToken) {
      // Update existing token
      const { data: updateData, error: updateError } = await supabase
        .from('student_tokens')
        .update(tokenData)
        .eq('student_id', studentId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        console.dir(updateError, { depth: null });
        throw updateError;
      }
      console.log('FCM token updated successfully', updateData);
    } else {
      // Insert new token
      const { data: insertData, error: insertError } = await supabase
        .from('student_tokens')
        .insert(tokenData);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        console.dir(insertError, { depth: null });
        throw insertError;
      }
      console.log('FCM token saved s ccessfully', insertData);
    }
  } catch (error) {
    console.error('Error saving FCM token       abase:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    } else {
      try {
        console.error('Error details:', JSON.stringify(error));
      } catch {
        console.error('Error details:', error);
      }
    }
  }
}

// Function to get pending notification actions and clear them
export function getPendingNotificationActions(): any[] {
  const actions = JSON.parse(localStorage.getItem('pendingNotificationActions') || '[]');
  localStorage.removeItem('pendingNotificationActions');
  return actions;
}

// Function to manually check for pending actions (call this on app start)
export function handlePendingNotificationActions() {
  const pendingActions = getPendingNotificationActions();
  
  if (pendingActions.length > 0) {
    console.log('Handling pending notification actions:', pendingActions);
    
    // Process each action
    pendingActions.forEach(actionData => {
      // Here you can add navigation logic based on the notification data
      console.log('Processing notification action:', actionData);
      
      // Example: Navigate to specific page based on notification type
      // const notificationType = actionData.notification?.data?.type;
      // if (notificationType === 'homework') {
      //   // Navigate to homework page
      // } else if (notificationType === 'announcement') {
      //   // Navigate to announcements page
      // }
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const permResult = await PushNotifications.requestPermissions();
    return permResult.receive === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}