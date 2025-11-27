import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import AdDetails from './pages/AdDetails';
import Profile from './pages/Profile';
import AdsList from './pages/AdsList';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfile';
import EditAd from './pages/EditAd';
import Inbox from './pages/Inbox';
import ChatRoom from './pages/ChatRoom';
import AccountSettings from './pages/AccountSettings';

function App() {
  return (
    <AuthProvider>
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
        <Route>404 - Page Not Found</Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;

