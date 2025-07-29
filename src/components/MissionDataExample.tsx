import React from 'react';
import { useMissionData } from './MissionDataContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Example component showing how to use the useMissionData hook
export function MissionDataExample() {
  const missionData = useMissionData();

  const handleCreateTask = async () => {
    const newTask = await missionData.tasks.create({
      title: 'Example Task',
      priority: 'HIGH',
      status: 'BACKLOG'
    });
    
    console.log('Created task:', newTask);
  };

  const handleMoveTask = async () => {
    const success = await missionData.moveTask.from('TODAY').to('DOING');
    console.log('Move task success:', success);
  };

  const handleCreateObjective = async () => {
    const newObjective = await missionData.objectives.create({
      title: 'Example Objective',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      priority: 'HIGH'
    });
    
    console.log('Created objective:', newObjective);
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-cyan-400/30">
      <h3 className="text-lg font-bold text-cyan-400 mb-4">Mission Data Hook Example</h3>
      
      <div className="space-y-4">
        {/* Data access examples */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Data Access:</h4>
          <div className="text-xs text-slate-300 space-y-1">
            <p>Tasks: {missionData.tasks.get().length} items (Loading: {missionData.tasks.isLoading ? 'Yes' : 'No'})</p>
            <p>Objectives: {missionData.objectives.get().length} items (Loading: {missionData.objectives.isLoading ? 'Yes' : 'No'})</p>
            <p>Reminders: {missionData.reminders.get().length} items</p>
            <p>Meetings: {missionData.meetings.get().length} items</p>
            <p>Notes: {missionData.notes.get().length} items</p>
          </div>
        </div>

        {/* Action examples */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Actions:</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={handleCreateTask}
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              Create Task
            </Button>
            <Button 
              size="sm" 
              onClick={handleMoveTask}
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              Move Task
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreateObjective}
              className="bg-purple-600 hover:bg-purple-700 text-xs"
            >
              Create Objective
            </Button>
            <Button 
              size="sm" 
              onClick={() => missionData.refreshAll()}
              className="bg-cyan-600 hover:bg-cyan-700 text-xs"
            >
              Refresh All
            </Button>
          </div>
        </div>

        {/* Error states */}
        {(missionData.tasks.error || missionData.objectives.error) && (
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2">Errors:</h4>
            <div className="text-xs text-red-300 space-y-1">
              {missionData.tasks.error && <p>Tasks: {missionData.tasks.error}</p>}
              {missionData.objectives.error && <p>Objectives: {missionData.objectives.error}</p>}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 