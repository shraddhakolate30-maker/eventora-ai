import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/PlanView';
import { BudgetPlanner } from './components/BudgetPlanner';
import { BudgetRescue } from './components/BudgetRescue';
import { ShoppingAssistant } from './components/ShoppingAssistant';
import { ReturnGiftPlanner } from './components/ReturnGiftPlanner';
import { TimelineTasks } from './components/TimelineTasks';
import { ChatAssistant } from './components/ChatAssistant';
import { Marketplace } from './components/Marketplace';
import { EventHistory } from './components/EventHistory';
import { CreateEventModal } from './components/CreateEventModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';
import { EventItem, UserProfile, EventType } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [events, setEvents] = useState<EventItem[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() =>
    StorageService.getActiveEventId()
  );
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<EventType | undefined>(undefined);

  // Sync with persistent server backend on mount
  useEffect(() => {
    ApiService.getStatus().then((status) => {
      setGeminiConfigured(status.geminiConfigured);
    });

    ApiService.getMe().then((serverUser) => {
      if (serverUser) {
        setUser(serverUser);
        StorageService.setUserProfile(serverUser);
      }
    });

    StorageService.syncFromServer().then((serverEvents) => {
      if (serverEvents.length > 0) {
        setEvents(serverEvents);
        const currentActive = StorageService.getActiveEventId();
        if (serverEvents.some((e) => e.id === currentActive)) {
          setActiveEventId(currentActive);
        } else {
          setActiveEventId(serverEvents[0].id);
        }
      }
    });
  }, []);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    StorageService.setActiveEventId(id);
  };

  const handleUpdateEvent = (updated: EventItem) => {
    const updatedList = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(updatedList);
  };

  const handleEventCreated = (newEvent: EventItem) => {
    setEvents([newEvent, ...events]);
    setActiveEventId(newEvent.id);
    setCurrentView('plan');
  };

  const handleDuplicateEvent = (id: string) => {
    const copy = StorageService.duplicateEvent(id);
    if (copy) {
      setEvents([copy, ...events]);
      setActiveEventId(copy.id);
      setCurrentView('dashboard');
    }
  };

  const handleDeleteEvent = (id: string) => {
    StorageService.deleteEvent(id);
    const remaining = events.filter((e) => e.id !== id);
    setEvents(remaining);
    if (remaining.length > 0) {
      setActiveEventId(remaining[0].id);
    } else {
      setActiveEventId('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!activeEvent) return;
    const updatedTasks = activeEvent.timelineTasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const updatedEvent = { ...activeEvent, timelineTasks: updatedTasks };
    StorageService.saveEvent(updatedEvent);
    handleUpdateEvent(updatedEvent);
  };

  const handleExploreCategory = (type: EventType) => {
    setPreselectedCategory(type);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased selection:bg-violet-100 selection:text-violet-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenCreateEvent={() => {
          setPreselectedCategory(undefined);
          setIsCreateModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        user={user}
        geminiConfigured={geminiConfigured}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onPlanEvent={() => {
              setPreselectedCategory(undefined);
              setIsCreateModalOpen(true);
            }}
            onExploreCategory={handleExploreCategory}
            onNavigate={setCurrentView}
            geminiConfigured={geminiConfigured}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            events={events}
            activeEvent={activeEvent}
            onSelectEvent={handleSelectEvent}
            onOpenCreateEvent={() => {
              setPreselectedCategory(undefined);
              setIsCreateModalOpen(true);
            }}
            onDuplicateEvent={handleDuplicateEvent}
            onDeleteEvent={handleDeleteEvent}
            onNavigate={setCurrentView}
            onOpenExport={() => setIsExportModalOpen(true)}
            onToggleTask={handleToggleTask}
          />
        )}

        {currentView === 'plan' && (
          <PlanView
            event={activeEvent}
            onNavigate={setCurrentView}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        )}

        {currentView === 'budget' && (
          <BudgetPlanner
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'rescue' && (
          <BudgetRescue
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'shopping' && (
          <ShoppingAssistant
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'gifts' && (
          <ReturnGiftPlanner
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'tasks' && (
          <TimelineTasks
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'chat' && (
          <ChatAssistant
            event={activeEvent}
            onUpdateEvent={handleUpdateEvent}
            geminiConfigured={geminiConfigured}
          />
        )}

        {currentView === 'history' && (
          <EventHistory
            event={activeEvent}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'marketplace' && <Marketplace />}
      </main>

      {/* Global Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        initialCategory={preselectedCategory}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        event={activeEvent}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
        onAuthSuccess={async () => {
          const serverEvents = await StorageService.syncFromServer();
          setEvents(serverEvents);
          if (serverEvents.length > 0) {
            setActiveEventId(serverEvents[0].id);
          }
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}
