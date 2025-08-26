import React, { useState } from 'react';
import { Plus, Search, Filter, GraduationCap, Play, BookOpen, Clock, Users, CheckCircle, Star, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { BoardProvider } from '@/context/BoardContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  enrolledStudents: number;
  progress?: number;
  status: 'not-started' | 'in-progress' | 'completed';
  thumbnail: string;
  lessons: number;
  createdAt: string;
}

const Training = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Mock data - replace with actual API call
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Project Management Fundamentals',
      description: 'Learn the basics of project management including planning, execution, and monitoring.',
      instructor: 'Sarah Johnson',
      duration: '4 hours',
      level: 'beginner',
      category: 'Management',
      rating: 4.8,
      enrolledStudents: 156,
      progress: 75,
      status: 'in-progress',
      thumbnail: '/api/placeholder/300/200',
      lessons: 12,
      createdAt: '2025-08-20'
    },
    {
      id: '2',
      title: 'Advanced Data Analysis with Excel',
      description: 'Master advanced Excel functions, pivot tables, and data visualization techniques.',
      instructor: 'Michael Chen',
      duration: '6 hours',
      level: 'advanced',
      category: 'Technical',
      rating: 4.9,
      enrolledStudents: 203,
      progress: 100,
      status: 'completed',
      thumbnail: '/api/placeholder/300/200',
      lessons: 18,
      createdAt: '2025-08-15'
    },
    {
      id: '3',
      title: 'Customer Service Excellence',
      description: 'Develop exceptional customer service skills and learn to handle difficult situations.',
      instructor: 'Emma Davis',
      duration: '3 hours',
      level: 'intermediate',
      category: 'Soft Skills',
      rating: 4.7,
      enrolledStudents: 98,
      progress: 0,
      status: 'not-started',
      thumbnail: '/api/placeholder/300/200',
      lessons: 10,
      createdAt: '2025-08-25'
    },
    {
      id: '4',
      title: 'Digital Marketing Strategies',
      description: 'Learn modern digital marketing techniques including SEO, social media, and content marketing.',
      instructor: 'Alex Rodriguez',
      duration: '5 hours',
      level: 'intermediate',
      category: 'Marketing',
      rating: 4.6,
      enrolledStudents: 127,
      progress: 45,
      status: 'in-progress',
      thumbnail: '/api/placeholder/300/200',
      lessons: 15,
      createdAt: '2025-08-18'
    },
    {
      id: '5',
      title: 'Leadership and Team Building',
      description: 'Develop leadership skills and learn effective team building strategies.',
      instructor: 'David Wilson',
      duration: '4.5 hours',
      level: 'intermediate',
      category: 'Leadership',
      rating: 4.8,
      enrolledStudents: 89,
      progress: 0,
      status: 'not-started',
      thumbnail: '/api/placeholder/300/200',
      lessons: 14,
      createdAt: '2025-08-22'
    },
    {
      id: '6',
      title: 'Financial Planning Basics',
      description: 'Learn fundamental financial planning concepts for business and personal finance.',
      instructor: 'Lisa Thompson',
      duration: '3.5 hours',
      level: 'beginner',
      category: 'Finance',
      rating: 4.5,
      enrolledStudents: 76,
      progress: 30,
      status: 'in-progress',
      thumbnail: '/api/placeholder/300/200',
      lessons: 11,
      createdAt: '2025-08-16'
    }
  ]);

  const categories = ['Management', 'Technical', 'Soft Skills', 'Marketing', 'Leadership', 'Finance'];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started':
        return <BookOpen className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const inProgressCourses = courses.filter(c => c.status === 'in-progress').length;
  const averageProgress = courses.filter(c => c.progress !== undefined).reduce((sum, c) => sum + (c.progress || 0), 0) / courses.filter(c => c.progress !== undefined).length;

  if (!user) return null;

  const TrainingContent = () => (
    <div className="h-full bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-900 dark:via-red-950/30 dark:to-orange-950/30 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-700 dark:from-slate-100 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                Training Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Enhance your skills with our comprehensive training programs</p>
            </div>
            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-xl px-6 py-3">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-sm backdrop-blur-sm focus:ring-2 focus:ring-red-500/30 focus:border-red-400 dark:focus:border-red-500 transition-all duration-200"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 h-12 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-white/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 dark:focus:border-red-500 backdrop-blur-sm transition-all duration-200 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3 h-12 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-white/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 backdrop-blur-sm transition-all duration-200 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Courses</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{totalCourses}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Completed</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{completedCourses}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">In Progress</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{inProgressCourses}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-xl">
                    <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Avg Progress</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{Math.round(averageProgress)}%</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all'
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by creating your first course.'}
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-purple-600" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getLevelColor(course.level)} border text-xs`}>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </Badge>
                        <Badge className={`${getStatusColor(course.status)} border text-xs`}>
                          {getStatusIcon(course.status)}
                          <span className="ml-1">
                            {course.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents} students</span>
                    </div>
                  </div>

                  {course.status === 'in-progress' && course.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {course.status === 'not-started' && (
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start Course
                      </Button>
                    )}
                    {course.status === 'in-progress' && (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    )}
                    {course.status === 'completed' && (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <Award className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BoardProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <TrainingContent />
        </div>
      </div>
    </BoardProvider>
  );
};

export default Training;
