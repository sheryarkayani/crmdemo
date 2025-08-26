import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Building, Mail, Phone, Package, Settings, Target, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { TaskData } from '@/types/board';
import { useBoardContext } from '@/context/BoardContext';
import { useUserContext } from '@/context/UserContext';

interface TaskActionPanelProps {
  task: TaskData;
  onClose: () => void;
}

const TaskActionPanel: React.FC<TaskActionPanelProps> = ({ task, onClose }) => {
  const { updateTask } = useBoardContext();
  const { getUserDisplayName } = useUserContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    requested_product: task.requested_product || '',
    requested_service: task.requested_service || '',
    product_sku: task.product_sku || '',
    service_type: task.service_type || '',
    stock_availability: task.stock_availability || '',
    estimated_delivery: task.estimated_delivery || '',
    technical_requirements: task.technical_requirements || '',
    client_budget: task.client_budget || '',
    urgency_level: task.urgency_level || 'Medium',
    lead_source: task.lead_source || 'Email',
    qualification_score: task.qualification_score || 50,
    client_company: task.client_company || '',
    client_contact_name: task.client_contact_name || '',
    client_email: task.client_email || '',
    vendor_company: task.vendor_company || '',
    vendor_contact: task.vendor_contact || '',
    vendor_email: task.vendor_email || '',
    unit_price: task.unit_price || '',
    quantity: task.quantity || '',
    markup_percentage: task.markup_percentage || ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updates: Partial<TaskData> = {
        title: formData.title,
        description: formData.description,
        requested_product: formData.requested_product,
        requested_service: formData.requested_service,
        product_sku: formData.product_sku,
        service_type: formData.service_type,
        stock_availability: formData.stock_availability,
        estimated_delivery: formData.estimated_delivery,
        technical_requirements: formData.technical_requirements,
        client_budget: formData.client_budget ? parseFloat(formData.client_budget.toString()) : null,
        urgency_level: formData.urgency_level,
        lead_source: formData.lead_source,
        qualification_score: parseInt(formData.qualification_score.toString()),
        client_company: formData.client_company,
        client_contact_name: formData.client_contact_name,
        client_email: formData.client_email,
        vendor_company: formData.vendor_company,
        vendor_contact: formData.vendor_contact,
        vendor_email: formData.vendor_email,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price.toString()) : null,
        quantity: formData.quantity ? parseInt(formData.quantity.toString()) : null,
        markup_percentage: formData.markup_percentage ? parseFloat(formData.markup_percentage.toString()) : null
      };

      await updateTask(task.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      requested_product: task.requested_product || '',
      requested_service: task.requested_service || '',
      product_sku: task.product_sku || '',
      service_type: formData.service_type || '',
      stock_availability: task.stock_availability || '',
      estimated_delivery: task.estimated_delivery || '',
      technical_requirements: task.technical_requirements || '',
      client_budget: task.client_budget || '',
      urgency_level: task.urgency_level || 'Medium',
      lead_source: task.lead_source || 'Email',
      qualification_score: task.qualification_score || 50,
      client_company: task.client_company || '',
      client_contact_name: task.client_contact_name || '',
      client_email: task.client_email || '',
      vendor_company: task.vendor_company || '',
      vendor_contact: task.vendor_contact || '',
      vendor_email: task.vendor_email || '',
      unit_price: task.unit_price || '',
      quantity: task.quantity || '',
      markup_percentage: task.markup_percentage || ''
    });
    setIsEditing(false);
  };

  const getQualificationColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getUrgencyColor = (level: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Critical': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level as keyof typeof colors] || colors.Medium;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Lead Details' : 'Lead Details'}
            </h2>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Lead
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Lead Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Lead Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Lead Title</Label>
                    {isEditing ? (
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter lead title"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter lead description"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.description || 'No description'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lead_source">Lead Source</Label>
                      {isEditing ? (
                        <Select value={formData.lead_source} onValueChange={(value) => handleInputChange('lead_source', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Social Media">Social Media</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="mt-1">{task.lead_source || 'Email'}</Badge>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="urgency_level">Urgency Level</Label>
                      {isEditing ? (
                        <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange('urgency_level', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`mt-1 ${getUrgencyColor(task.urgency_level || 'Medium')}`}>
                          {task.urgency_level || 'Medium'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qualification_score">Qualification Score</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.qualification_score}
                          onChange={(e) => handleInputChange('qualification_score', parseInt(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getQualificationColor(task.qualification_score || 50)}>
                          {task.qualification_score || 50}
                        </Badge>
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client_company">Company Name</Label>
                    {isEditing ? (
                      <Input
                        id="client_company"
                        value={formData.client_company}
                        onChange={(e) => handleInputChange('client_company', e.target.value)}
                        placeholder="Enter company name"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.client_company || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_contact_name">Contact Name</Label>
                      {isEditing ? (
                        <Input
                          id="client_contact_name"
                          value={formData.client_contact_name}
                          onChange={(e) => handleInputChange('client_contact_name', e.target.value)}
                          placeholder="Enter contact name"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.client_contact_name || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="client_email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="client_email"
                          type="email"
                          value={formData.client_email}
                          onChange={(e) => handleInputChange('client_email', e.target.value)}
                          placeholder="Enter email"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.client_email || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="client_budget">Client Budget</Label>
                    {isEditing ? (
                      <Input
                        id="client_budget"
                        type="number"
                        step="0.01"
                        value={formData.client_budget}
                        onChange={(e) => handleInputChange('client_budget', e.target.value)}
                        placeholder="Enter budget amount"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {task.client_budget ? `$${task.client_budget.toLocaleString()}` : 'Not specified'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Product/Service Information */}
            <div className="space-y-6">
              {/* Product/Service Request */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product/Service Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="requested_product">Product Name</Label>
                      {isEditing ? (
                        <Input
                          id="requested_product"
                          value={formData.requested_product}
                          onChange={(e) => handleInputChange('requested_product', e.target.value)}
                          placeholder="Enter product name"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.requested_product || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="product_sku">Product SKU</Label>
                      {isEditing ? (
                        <Input
                          id="product_sku"
                          value={formData.product_sku}
                          onChange={(e) => handleInputChange('product_sku', e.target.value)}
                          placeholder="Enter SKU"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.product_sku || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="requested_service">Service Type</Label>
                      {isEditing ? (
                        <Input
                          id="requested_service"
                          value={formData.requested_service}
                          onChange={(e) => handleInputChange('requested_service', e.target.value)}
                          placeholder="Enter service type"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.requested_service || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="service_type">Service Category</Label>
                      {isEditing ? (
                        <Input
                          id="service_type"
                          value={formData.service_type}
                          onChange={(e) => handleInputChange('service_type', e.target.value)}
                          placeholder="Enter service category"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.service_type || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technical_requirements">Technical Requirements</Label>
                    {isEditing ? (
                      <Textarea
                        id="technical_requirements"
                        value={formData.technical_requirements}
                        onChange={(e) => handleInputChange('technical_requirements', e.target.value)}
                        placeholder="Enter technical requirements"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.technical_requirements || 'No technical requirements specified'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stock & Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Stock & Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock_availability">Stock Availability</Label>
                      {isEditing ? (
                        <Select value={formData.stock_availability} onValueChange={(value) => handleInputChange('stock_availability', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Stock">In Stock</SelectItem>
                            <SelectItem value="Low Stock">Low Stock</SelectItem>
                            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            <SelectItem value="Available on Order">Available on Order</SelectItem>
                            <SelectItem value="Custom Made">Custom Made</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="mt-1">
                          {task.stock_availability || 'Not specified'}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
                      {isEditing ? (
                        <Input
                          id="estimated_delivery"
                          value={formData.estimated_delivery}
                          onChange={(e) => handleInputChange('estimated_delivery', e.target.value)}
                          placeholder="e.g., 2-3 weeks"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.estimated_delivery || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      {isEditing ? (
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          placeholder="Enter quantity"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.quantity || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="unit_price">Unit Price</Label>
                      {isEditing ? (
                        <Input
                          id="unit_price"
                          type="number"
                          step="0.01"
                          value={formData.unit_price}
                          onChange={(e) => handleInputChange('unit_price', e.target.value)}
                          placeholder="Enter price"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {task.unit_price ? `$${task.unit_price.toLocaleString()}` : 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="markup_percentage">Markup %</Label>
                      {isEditing ? (
                        <Input
                          id="markup_percentage"
                          type="number"
                          step="0.01"
                          value={formData.markup_percentage}
                          onChange={(e) => handleInputChange('markup_percentage', e.target.value)}
                          placeholder="Enter markup"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {task.markup_percentage ? `${task.markup_percentage}%` : 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vendor_company">Vendor Company</Label>
                    {isEditing ? (
                      <Input
                        id="vendor_company"
                        value={formData.vendor_company}
                        onChange={(e) => handleInputChange('vendor_company', e.target.value)}
                        placeholder="Enter vendor company name"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.vendor_company || 'Not specified'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor_contact">Vendor Contact</Label>
                      {isEditing ? (
                        <Input
                          id="vendor_contact"
                          value={formData.vendor_contact}
                          onChange={(e) => handleInputChange('vendor_contact', e.target.value)}
                          placeholder="Enter vendor contact name"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.vendor_contact || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="vendor_email">Vendor Email</Label>
                      {isEditing ? (
                        <Input
                          id="vendor_email"
                          type="email"
                          value={formData.vendor_email}
                          onChange={(e) => handleInputChange('vendor_email', e.target.value)}
                          placeholder="Enter vendor email"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{task.vendor_email || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Lead
                  </Button>
                  <Button variant="outline">
                    View History
                  </Button>
                </div>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskActionPanel; 