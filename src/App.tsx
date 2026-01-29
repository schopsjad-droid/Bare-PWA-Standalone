import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { UnreadMessagesProvider } from './contexts/UnreadMessagesContext';
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

function App() {
  return (
    <AuthProvider>
      <UnreadMessagesProvider>
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
          <Route path="/account-settings" component={AccountSettings} />
          <Route path="/admin/migrate" component={AdminMigrate} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/seller/:sellerId" component={SellerProfile} />
          <Route path="/about" component={About} />
          <Route path="/privacy" component={Privacy} />
          <Route>404 - Page Not Found</Route>
        </Switch>
      </UnreadMessagesProvider>
    </AuthProvider>
  );
}

export default App;
