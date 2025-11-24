import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAd from './pages/CreateAd';
import AdDetails from './pages/AdDetails';
import Profile from './pages/Profile';
import AdsList from './pages/AdsList';

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
        <Route>404 - Page Not Found</Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;

