import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FieldConfig } from '@/lib/db/schema';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SortableFieldItemProps {
  id: string;
  field: FieldConfig;
  fieldName: string;
  onFieldChange: (fieldName: string, newConfig: FieldConfig) => void;
}

export function SortableFieldItem({ id, field, fieldName, onFieldChange }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleFieldConfigChange = (prop: keyof FieldConfig, value: any) => {
    onFieldChange(fieldName, { ...field, [prop]: value });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-2">
      <Card>
        <Accordion type="single" collapsible>
          <AccordionItem value={fieldName} className="border-b-0">
            <AccordionTrigger className="p-3 flex items-center gap-2 w-full">
              <div {...listeners} className="cursor-grab p-2 -ml-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-grow text-left">
                <p className="font-medium">{field.label || fieldName}</p>
                <p className="text-sm text-muted-foreground">{fieldName}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                    <div>
                        <Label>Label</Label>
                        <Input value={field.label || ''} onChange={(e) => handleFieldConfigChange('label', e.target.value)} />
                    </div>
                    <div>
                        <Label>Icon</Label>
                        <Input value={field.icon || ''} onChange={(e) => handleFieldConfigChange('icon', e.target.value)} />
                        <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">
                            Browse Lucide Icons
                        </a>
                    </div>
                    <div>
                        <Label>Color (Tailwind)</Label>
                        <Input value={field.color || ''} onChange={(e) => handleFieldConfigChange('color', e.target.value)} />
                    </div>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}

interface SortableFieldsProps {
  fields: Record<string, FieldConfig>;
  onFieldsChange: (fields: Record<string, FieldConfig>) => void;
}

export function SortableFields({ fields, onFieldsChange }: SortableFieldsProps) {
  const fieldOrder = React.useMemo(() => {
    return Object.entries(fields)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
      .map(([key]) => key);
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fieldOrder.indexOf(active.id as string);
      const newIndex = fieldOrder.indexOf(over.id as string);
      const newOrder = arrayMove(fieldOrder, oldIndex, newIndex);

      const newFields = { ...fields };
      newOrder.forEach((key, index) => {
        newFields[key] = { ...newFields[key], order: index };
      });

      onFieldsChange(newFields);
    }
  }

  const handleFieldChange = (fieldName: string, newConfig: FieldConfig) => {
    const newFields = { ...fields, [fieldName]: newConfig };
    onFieldsChange(newFields);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fieldOrder} strategy={verticalListSortingStrategy}>
        {fieldOrder.map(fieldName => (
          <SortableFieldItem
            key={fieldName}
            id={fieldName}
            fieldName={fieldName}
            field={fields[fieldName]}
            onFieldChange={handleFieldChange}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
