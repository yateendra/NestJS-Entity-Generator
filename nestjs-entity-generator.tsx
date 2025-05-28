"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Plus, Trash2, Edit } from "lucide-react"

interface Property {
  id: string
  name: string
  dataType: string
  defaultValue?: string
  length?: string
  isOptional: boolean
  isUnique: boolean
  allowNull: boolean
  isPrimaryKey: boolean
}

export default function Component() {
  const [entityName, setEntityName] = useState("fdfsdf")
  const [tableName, setTableName] = useState("fdfsf")
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: "",
    dataType: "string",
    defaultValue: "",
    length: "",
    isOptional: false,
    isUnique: false,
    allowNull: false,
    isPrimaryKey: false,
  })

  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)
  const [editProperty, setEditProperty] = useState<Partial<Property>>({})

  const dataTypes = [
    "string",
    "number",
    "boolean",
    "Date",
    "text",
    "varchar",
    "int",
    "bigint",
    "decimal",
    "float",
    "json",
  ]

  const generateCode = () => {
    const className = entityName.charAt(0).toUpperCase() + entityName.slice(1)
    const imports = ["Column", "CreateDateColumn", "Entity", "PrimaryGeneratedColumn"]
    if (includeTimestamps) {
      imports.push("UpdateDateColumn")
    }

    let code = `import { ${imports.join(", ")} } from 'typeorm';\n\n`
    code += `@Entity('${tableName}')\n`
    code += `export class ${className} {\n`
    code += `  @PrimaryGeneratedColumn()\n`
    code += `  id: number;\n\n`

    properties.forEach((prop) => {
      const decorators = []
      const columnOptions = []

      if (prop.isPrimaryKey) {
        decorators.push("@PrimaryGeneratedColumn()")
      } else {
        if (prop.length) columnOptions.push(`length: ${prop.length}`)
        if (prop.defaultValue) columnOptions.push(`default: '${prop.defaultValue}'`)
        if (prop.isUnique) columnOptions.push("unique: true")
        if (prop.allowNull) columnOptions.push("nullable: true")

        const options = columnOptions.length > 0 ? `{ ${columnOptions.join(", ")} }` : ""
        decorators.push(`@Column(${options})`)
      }

      decorators.forEach((decorator) => {
        code += `  ${decorator}\n`
      })

      const nullable = prop.isOptional || prop.allowNull ? "?" : ""
      const type = prop.dataType === "Date" ? "Date" : prop.dataType
      code += `  ${prop.name}${nullable}: ${type};\n\n`
    })

    if (includeTimestamps) {
      code += `  @CreateDateColumn()\n`
      code += `  createdAt: Date;\n\n`
      code += `  @UpdateDateColumn()\n`
      code += `  updatedAt: Date;\n\n`
    }

    code += `}`

    return code
  }

  const handleSaveProperty = () => {
    if (newProperty.name && newProperty.dataType) {
      const property: Property = {
        id: Date.now().toString(),
        name: newProperty.name || "",
        dataType: newProperty.dataType || "string",
        defaultValue: newProperty.defaultValue,
        length: newProperty.length,
        isOptional: newProperty.isOptional || false,
        isUnique: newProperty.isUnique || false,
        allowNull: newProperty.allowNull || false,
        isPrimaryKey: newProperty.isPrimaryKey || false,
      }
      setProperties([...properties, property])
      setNewProperty({
        name: "",
        dataType: "string",
        defaultValue: "",
        length: "",
        isOptional: false,
        isUnique: false,
        allowNull: false,
        isPrimaryKey: false,
      })
      setShowAddProperty(false)
    }
  }

  const handleCancel = () => {
    setNewProperty({
      name: "",
      dataType: "string",
      defaultValue: "",
      length: "",
      isOptional: false,
      isUnique: false,
      allowNull: false,
      isPrimaryKey: false,
    })
    setShowAddProperty(false)
  }

  const handleDeleteProperty = (propertyId: string) => {
    setProperties(properties.filter((prop) => prop.id !== propertyId))
  }

  const handleEditProperty = (property: Property) => {
    setEditingPropertyId(property.id)
    setEditProperty(property)
  }

  const handleSaveEdit = () => {
    if (editingPropertyId && editProperty.name && editProperty.dataType) {
      setProperties(
        properties.map((prop) => (prop.id === editingPropertyId ? ({ ...prop, ...editProperty } as Property) : prop)),
      )
      setEditingPropertyId(null)
      setEditProperty({})
    }
  }

  const handleCancelEdit = () => {
    setEditingPropertyId(null)
    setEditProperty({})
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCode())
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NestJS Entity Generator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate TypeScript entities with proper NestJS decorators, relationships, and best practices. Perfect for
            rapid API development.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Entity Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Entity Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="entityName">Entity Name *</Label>
                <Input
                  id="entityName"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g., User, Product, Order"
                />
                <p className="text-xs text-gray-500">Use PascalCase for the entity class name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Leave empty to use default naming convention"
                />
                <p className="text-xs text-gray-500">Leave empty to use default naming convention</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="timestamps" checked={includeTimestamps} onCheckedChange={setIncludeTimestamps} />
                <Label htmlFor="timestamps">Include timestamps (createdAt, updatedAt)</Label>
              </div>

              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Entity Properties</h3>
                    <span className="text-sm text-gray-500">{properties.length} properties</span>
                  </div>

                  {properties.length > 0 && (
                    <div className="space-y-2">
                      {properties.map((prop) => (
                        <div key={prop.id} className="p-3 border rounded-lg bg-gray-50">
                          {editingPropertyId === prop.id ? (
                            // Edit mode
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-name-${prop.id}`}>Property Name *</Label>
                                  <Input
                                    id={`edit-name-${prop.id}`}
                                    value={editProperty.name || ""}
                                    onChange={(e) => setEditProperty({ ...editProperty, name: e.target.value })}
                                    placeholder="e.g., name, email, age"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-type-${prop.id}`}>Data Type *</Label>
                                  <Select
                                    value={editProperty.dataType || "string"}
                                    onValueChange={(value) => setEditProperty({ ...editProperty, dataType: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {dataTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-default-${prop.id}`}>Default Value</Label>
                                  <Input
                                    id={`edit-default-${prop.id}`}
                                    value={editProperty.defaultValue || ""}
                                    onChange={(e) => setEditProperty({ ...editProperty, defaultValue: e.target.value })}
                                    placeholder="Optional default value"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-length-${prop.id}`}>Length</Label>
                                  <Input
                                    id={`edit-length-${prop.id}`}
                                    value={editProperty.length || ""}
                                    onChange={(e) => setEditProperty({ ...editProperty, length: e.target.value })}
                                    placeholder="e.g., 255 for varchar"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-optional-${prop.id}`}
                                    checked={editProperty.isOptional || false}
                                    onCheckedChange={(checked) =>
                                      setEditProperty({ ...editProperty, isOptional: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor={`edit-optional-${prop.id}`}>Optional property</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-unique-${prop.id}`}
                                    checked={editProperty.isUnique || false}
                                    onCheckedChange={(checked) =>
                                      setEditProperty({ ...editProperty, isUnique: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor={`edit-unique-${prop.id}`}>Unique constraint</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-allowNull-${prop.id}`}
                                    checked={editProperty.allowNull || false}
                                    onCheckedChange={(checked) =>
                                      setEditProperty({ ...editProperty, allowNull: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor={`edit-allowNull-${prop.id}`}>Allow null values</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-primaryKey-${prop.id}`}
                                    checked={editProperty.isPrimaryKey || false}
                                    onCheckedChange={(checked) =>
                                      setEditProperty({ ...editProperty, isPrimaryKey: checked as boolean })
                                    }
                                  />
                                  <Label htmlFor={`edit-primaryKey-${prop.id}`}>Primary key</Label>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                                  Save Changes
                                </Button>
                                <Button onClick={handleCancelEdit} variant="outline" size="sm" className="flex-1">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{prop.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{prop.dataType}</span>
                                  <Button
                                    onClick={() => handleEditProperty(prop)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteProperty(prop.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-1">
                                {prop.isOptional && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Optional</span>
                                )}
                                {prop.isUnique && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Unique</span>
                                )}
                                {prop.isPrimaryKey && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    Primary Key
                                  </span>
                                )}
                                {prop.allowNull && (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Nullable</span>
                                )}
                                {prop.defaultValue && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Default: {prop.defaultValue}
                                  </span>
                                )}
                                {prop.length && (
                                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                    Length: {prop.length}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddProperty ? (
                    <Button onClick={() => setShowAddProperty(true)} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Add Property</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="propName">Property Name *</Label>
                            <Input
                              id="propName"
                              value={newProperty.name || ""}
                              onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                              placeholder="e.g., name, email, age"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dataType">Data Type *</Label>
                            <Select
                              value={newProperty.dataType || "string"}
                              onValueChange={(value) => setNewProperty({ ...newProperty, dataType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {dataTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="defaultValue">Default Value</Label>
                            <Input
                              id="defaultValue"
                              value={newProperty.defaultValue || ""}
                              onChange={(e) => setNewProperty({ ...newProperty, defaultValue: e.target.value })}
                              placeholder="Optional default value"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="length">Length</Label>
                            <Input
                              id="length"
                              value={newProperty.length || ""}
                              onChange={(e) => setNewProperty({ ...newProperty, length: e.target.value })}
                              placeholder="e.g., 255 for varchar"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="optional"
                              checked={newProperty.isOptional || false}
                              onCheckedChange={(checked) =>
                                setNewProperty({ ...newProperty, isOptional: checked as boolean })
                              }
                            />
                            <Label htmlFor="optional">Optional property</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="unique"
                              checked={newProperty.isUnique || false}
                              onCheckedChange={(checked) =>
                                setNewProperty({ ...newProperty, isUnique: checked as boolean })
                              }
                            />
                            <Label htmlFor="unique">Unique constraint</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allowNull"
                              checked={newProperty.allowNull || false}
                              onCheckedChange={(checked) =>
                                setNewProperty({ ...newProperty, allowNull: checked as boolean })
                              }
                            />
                            <Label htmlFor="allowNull">Allow null values</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="primaryKey"
                              checked={newProperty.isPrimaryKey || false}
                              onCheckedChange={(checked) =>
                                setNewProperty({ ...newProperty, isPrimaryKey: checked as boolean })
                              }
                            />
                            <Label htmlFor="primaryKey">Primary key</Label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveProperty} className="flex-1">
                            Save Property
                          </Button>
                          <Button onClick={handleCancel} variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="relationships">
                  <div className="text-center py-8 text-gray-500">Relationships configuration coming soon...</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Panel - Generated Code */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Generated Code
                  </CardTitle>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TypeScript Entity</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">NestJS + TypeORM</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[400px] lg:max-h-[500px]">
                  <pre>{generateCode()}</pre>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-700">Usage:</span>
                    <span className="text-gray-600">Save this code as a .ts file in your NestJS entities folder</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700">Required packages:</span>
                    <span className="text-gray-600">@nestjs/typeorm, typeorm, class-validator</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
