
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Brain, FileText, Database, GitMerge, Search } from 'lucide-react'

interface ContextConfig {
    includeMedicalProfile: boolean
    includeDocuments: boolean
    includeStructuredData: boolean
    includeRagContext: boolean
    includePreviousAnalysis: boolean
}

interface ContextSettingsDialogProps {
    agentName: string
    config: ContextConfig
    isOpen: boolean
    onClose: () => void
    onSave: (newConfig: ContextConfig) => void
}

export function ContextSettingsDialog({
    agentName,
    config,
    isOpen,
    onClose,
    onSave
}: ContextSettingsDialogProps) {
    const [localConfig, setLocalConfig] = useState<ContextConfig>(config)

    useEffect(() => {
        if (isOpen) {
            setLocalConfig(config)
        }
    }, [config, isOpen])

    const handleToggle = (key: keyof ContextConfig) => {
        setLocalConfig(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSave = () => {
        onSave(localConfig)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Configurar Contexto: {agentName}</DialogTitle>
                    <DialogDescription>
                        Defina quais informações este agente receberá durante a análise.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-5">
                    {/* Medical Profile */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-md dark:bg-blue-900/30">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="medical-profile" className="text-base font-medium">Perfil Médico</Label>
                                <p className="text-xs text-muted-foreground">
                                    Ficha do paciente (idade, peso, histórico)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="medical-profile"
                            checked={localConfig.includeMedicalProfile}
                            onCheckedChange={() => handleToggle('includeMedicalProfile')}
                        />
                    </div>

                    {/* Raw Documents */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-2 rounded-md dark:bg-amber-900/30">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="documents" className="text-base font-medium">Documentos Brutos</Label>
                                <p className="text-xs text-muted-foreground">
                                    Texto extraído original dos PDFs
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="documents"
                            checked={localConfig.includeDocuments}
                            onCheckedChange={() => handleToggle('includeDocuments')}
                        />
                    </div>

                    {/* Structured Data */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-md dark:bg-purple-900/30">
                                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="structured-data" className="text-base font-medium">Dados Estruturados</Label>
                                <p className="text-xs text-muted-foreground">
                                    JSON processado pelo Cérebro Lógico
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="structured-data"
                            checked={localConfig.includeStructuredData}
                            onCheckedChange={() => handleToggle('includeStructuredData')}
                        />
                    </div>

                    {/* RAG Context */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-100 p-2 rounded-md dark:bg-emerald-900/30">
                                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="rag-context" className="text-base font-medium">Contexto RAG</Label>
                                <p className="text-xs text-muted-foreground">
                                    Resultados da busca na base de conhecimento
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="rag-context"
                            checked={localConfig.includeRagContext}
                            onCheckedChange={() => handleToggle('includeRagContext')}
                        />
                    </div>

                    {/* Previous Analysis */}
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-rose-100 p-2 rounded-md dark:bg-rose-900/30">
                                <GitMerge className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="prev-analysis" className="text-base font-medium">Análise Anterior</Label>
                                <p className="text-xs text-muted-foreground">
                                    Resultado da análise de Fundação (para especialistas)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="prev-analysis"
                            checked={localConfig.includePreviousAnalysis}
                            onCheckedChange={() => handleToggle('includePreviousAnalysis')}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
