import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { UnreadMessagesProvider, useUnreadMessages } from './contexts/UnreadMessagesContext';
import InAppNotification from './components/InAppNotification';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import AdDetails from './pages/AdDetails';
import Profile from './pages/Profile';
import AdsList from './pages/AdsList';
import AdminMigrate from './pages/AdminMigrate';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfile';
import EditAd from './pages/EditAd';
import Inbox from './pages/Inbox';
import ChatRoom from './pages/ChatRoom';
import AccountSettings from './pages/AccountSettings';
import Favorites from './pages/Favorites';
import SellerProfile from './pages/SellerProfile';
import About from './pages/About';
import Privacy from './pages/Privacy';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import NotificationSettings from './pages/NotificationSettings';
import MapResults from './pages/MapResults';

function NotificationLayer() {
  const { latestNotification, dismissNotification } = useUnreadMessages();
  return <InAppNotification notification={latestNotification} onDismiss={dismissNotification} />;
}

function App() {
  return (
    <AuthProvider>
      <UnreadMessagesProvider>
        <NotificationLayer />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/create-ad" component={CreateAd} />
          <Route path="/ad/:id" component={AdDetails} />
          <Route path="/profile" component={Profile} />
          <Route path="/category/:categoryId" component={AdsList} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/complete-profile" component={CompleteProfile} />
          <Route path="/edit-ad/:id" component={EditAd} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/messages" component={Inbox} />
          <Route path="/chat/:chatId" component={ChatRoom} />
          <Route path="/settings" component={Settings} />
          <Route path="/settings/notifications" component={NotificationSettings} />
          <Route path="/account-settings" component={AccountSettings} />
          <Route path="/admin/migrate" component={AdminMigrate} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/seller/:sellerId" component={SellerProfile} />
          <Route path="/about" component={About} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/map" component={MapResults} />
          <Route>404 - Page Not Found</Route>
        </Switch>
      </UnreadMessagesProvider>
    </AuthProvider>
  );
}

export default App;
