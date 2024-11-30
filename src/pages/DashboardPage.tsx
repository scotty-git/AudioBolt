import { useAuth } from '../hooks/useAuth';
import { useUserSubmissions } from '../hooks/useDatabase';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { onboarding, questionnaires, loading } = useUserSubmissions();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.displayName || 'User'}
        </h1>
        
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{user?.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <Badge variant={user?.isAnonymous ? 'warning' : 'success'}>
                  {user?.isAnonymous ? 'Anonymous' : 'Registered'}
                </Badge>
              </div>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  Manage Profile
                </Button>
              </Link>
            </div>
          </Card>

          {/* Progress Card */}
          <Card>
            <h2 className="text-lg font-medium text-gray-900">Your Progress</h2>
            <div className="mt-4 space-y-4">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Onboarding</p>
                    <Badge variant={onboarding.length > 0 ? 'success' : 'warning'}>
                      {onboarding.length > 0 ? 'Completed' : 'Not Started'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Questionnaires Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{questionnaires.length}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              {!onboarding.length && (
                <Link to="/onboarding">
                  <Button variant="primary" className="w-full">
                    Start Onboarding
                  </Button>
                </Link>
              )}
              <Link to="/questionnaires">
                <Button variant="outline" className="w-full">
                  View Questionnaires
                </Button>
              </Link>
              <Link to="/submissions">
                <Button variant="outline" className="w-full">
                  View Submissions
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
