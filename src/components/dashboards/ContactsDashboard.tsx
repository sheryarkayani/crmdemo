import React, { useState } from 'react';
import { Users, Mail, Building2, Phone, DollarSign, TrendingUp, Star, Filter, Calendar, MoreHorizontal, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBoardContext } from '@/context/BoardContext';
import { useUserContext } from '@/context/UserContext';
import VendorRegistrationForm, { VendorFormData } from '@/components/dialogs/VendorRegistrationForm';
import { EnhancedEmailService } from '@/lib/enhanced-email-service';
import { useToast } from '@/hooks/use-toast';

const ContactsDashboard = () => {
  const { currentBoard, refreshCurrentBoard } = useBoardContext();
  const { getUserDisplayName, getUserInitials } = useUserContext();
  const { toast } = useToast();
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);

  if (!currentBoard) return null;

  const allContacts = (currentBoard.groups || []).flatMap(group => group.tasks || []);
  const totalContacts = allContacts.length;

  // Calculate contact statistics
  const totalSalesValue = allContacts.reduce((sum, contact) => sum + (contact.number_field || 0), 0);
  const hotContacts = allContacts.filter(contact => contact.priority === 'High').length;
  const activeAccounts = allContacts.filter(contact => contact.status === 'Active').length;
  const recentContacts = allContacts.filter(contact => {
    if (!contact.created_at) return false;
    const contactDate = new Date(contact.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return contactDate >= weekAgo;
  }).length;

  // Contact type distribution
  const contactTypes = allContacts.reduce((acc, contact) => {
    const type = contact.text_field || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority distribution
  const priorityDistribution = allContacts.reduce((acc, contact) => {
    const priority = contact.priority || 'Medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleVendorRegistration = async (vendorData: VendorFormData) => {
    try {
      await EnhancedEmailService.registerVendorFromForm(vendorData);
      await refreshCurrentBoard();
      toast({
        title: "Contact Registered",
        description: `${vendorData.contactName} has been successfully added to the contacts board.`,
      });
    } catch (error) {
      console.error('Error registering vendor:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register the contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Senior': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Regular': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your contacts and relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => setIsVendorFormOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalContacts}</div>
              <div className="text-xs text-gray-500 mt-1">
                +{recentContacts} this week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${totalSalesValue.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">
                Active pipeline
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Hot Contacts</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{hotContacts}</div>
              <div className="text-xs text-red-600 mt-1">
                High priority
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeAccounts}</div>
              <div className="text-xs text-purple-600 mt-1">
                Engaged companies
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Types */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Contact Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(contactTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(type)}>
                        {type}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(priorityDistribution).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(priority)}>
                        {priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allContacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${getAvatarColor(contact.title)} text-white text-xs`}>
                        {contact.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.client_email || 'No email'}
                      </p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(contact.priority || 'Medium')}>
                      {contact.priority || 'Medium'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Contacts */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Contact</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Company</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Sales Value</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Priority</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Owner</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allContacts.slice(0, 10).map((contact) => (
                    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`${getAvatarColor(contact.title)} text-white text-xs`}>
                              {contact.title.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{contact.title}</p>
                            <p className="text-xs text-gray-500">{contact.description || 'Contact'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-sm">{contact.client_email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Building2 className="w-3 h-3" />
                          <span className="text-sm">{contact.client_company || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-green-600">
                          ${(contact.number_field || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={getTypeColor(contact.text_field || 'Regular')}>
                          {contact.text_field || 'Regular'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={getPriorityColor(contact.priority || 'Medium')}>
                          {contact.priority || 'Medium'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                              {getUserInitials(contact.assignee_id || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {getUserDisplayName(contact.assignee_id || '').split(' ')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Registration Form */}
      <VendorRegistrationForm
        isOpen={isVendorFormOpen}
        onClose={() => setIsVendorFormOpen(false)}
        onSubmit={handleVendorRegistration}
      />
    </div>
  );
};

export default ContactsDashboard; 