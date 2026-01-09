'use client'

import { useState, useTransition, useMemo } from 'react'
import type { HealthAgent, DisplayConfig } from '@/lib/db/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SortableFields } from './sortable-fields'
import { updateDisplayConfig } from '@/app/(admin)/display-configs/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
// import { ProductRenderer } from '@/components/dynamic-renderer/product-renderer'

interface DisplayConfigEditorProps {
  agents: HealthAgent[]
}

export function DisplayConfigEditor({ agents }: DisplayConfigEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [currentConfig, setCurrentConfig] = useState<DisplayConfig | null>(null)

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId)
    const agent = agents.find(a => a.id === agentId)
    if (agent && agent.displayConfig) {
      setCurrentConfig(JSON.parse(JSON.stringify(agent.displayConfig)))
    } else {
      setCurrentConfig(null)
    }
  }

  const handleConfigChange = (field: keyof DisplayConfig, value: any) => {
    if (currentConfig) {
      setCurrentConfig({ ...currentConfig, [field]: value })
    }
  }

  const handleSave = () => {
    if (!selectedAgentId || !currentConfig) return

    startTransition(async () => {
      const result = await updateDisplayConfig(selectedAgentId, currentConfig)
      if (result.success) {
        toast.success('Display config updated successfully!')
        const agentIndex = agents.findIndex(a => a.id === selectedAgentId)
        if (agentIndex !== -1) {
          agents[agentIndex].displayConfig = JSON.parse(JSON.stringify(currentConfig));
        }
      } else {
        toast.error(result.message || 'Failed to update display config.')
      }
    })
  }

  const mockData = useMemo(() => {
    if (!currentConfig) return {}
    const data: any = {}
    for (const key in currentConfig.fields) {
      const fieldConfig = currentConfig.fields[key];
      if (fieldConfig.displayType === 'list') {
        data[key] = ['Mock item 1', 'Mock item 2', 'Mock item 3'];
      } else if (fieldConfig.displayType === 'table') {
        data[key] = [{ col1: 'Row 1, Col 1', col2: 'Row 1, Col 2' }, { col1: 'Row 2, Col 1', col2: 'Row 2, Col 2' }];
      } else {
        data[key] = `This is mock content for the '${fieldConfig.label || key}' field. It's a simple string.`
      }
    }
    return data
  }, [currentConfig])

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleAgentSelect} value={selectedAgentId || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent to edit" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAgent && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>ID:</strong> {selectedAgent.id}</p>
                <p><strong>Key:</strong> {selectedAgent.generatorKey}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {currentConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentConfig.title || ''}
                  onChange={e => handleConfigChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentConfig.description || ''}
                  onChange={e => handleConfigChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-4">
        {currentConfig ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fields</CardTitle>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardHeader>
            <CardContent>
              <SortableFields
                fields={currentConfig.fields}
                onFieldsChange={newFields => handleConfigChange('fields', newFields)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Select an agent to start editing.</p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-5">
        {currentConfig ? (
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
              {/* <ProductRenderer data={mockData} displayConfig={currentConfig} /> */}
              <p>Preview temporarily disabled (Component missing)</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Select an agent to see a preview.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
