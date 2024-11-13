import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoryLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data);
    } catch (err) {
      setError('Failed to fetch stories');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (id) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .match({ id, user_id: user.id });

      if (error) throw error;
      setStories(stories.filter(story => story.id !== id));
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
    } catch (err) {
      setError('Failed to delete story');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-2 text-purple-600">Loading your magical stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-6">
        <Button
          onClick={() => setSelectedStory(null)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{selectedStory.title}</CardTitle>
            <CardDescription>
              A story for {selectedStory.child_name} ({selectedStory.child_age} years old)
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-purple max-w-none">
            <div className="space-y-4">
              {selectedStory.image_urls?.length > 0 && (
                <div className="flex justify-center">
                  <img
                    src={selectedStory.image_urls[0]}
                    alt="Story illustration"
                    className="rounded-lg max-h-96 object-contain"
                  />
                </div>
              )}
              <div className="whitespace-pre-wrap">{selectedStory.content}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800">My Story Library</h1>
          <Button onClick={() => navigate('/create-story')} className="bg-purple-600 hover:bg-purple-700">
            Create New Story
          </Button>
        </div>
        
        {stories.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">No stories yet!</h2>
              <p className="text-gray-500 mb-6">Start your magical journey by creating your first story.</p>
              <Button onClick={() => navigate('/create-story')} className="bg-purple-600 hover:bg-purple-700">
                Create Your First Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-lg font-semibold truncate">{story.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStory(story.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Created for: {story.child_name} ({story.child_age} years old)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Theme: {story.theme}</p>
                    {story.image_urls?.[0] && (
                      <img
                        src={story.image_urls[0]}
                        alt="Story thumbnail"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <Button 
                        onClick={() => setSelectedStory(story)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                      >
                        <BookOpen className="h-4 w-4" />
                        Read Story
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
