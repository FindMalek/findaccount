"use client"

import { ContainerEntity } from "@/entities/utils/container/entity"
import { useCreateContainer } from "@/orpc/hooks/use-containers"
import {
  containerDtoSchema,
  LIST_CONTAINER_TYPES,
  type ContainerDto,
} from "@/schemas/utils/container"
import { zodResolver } from "@hookform/resolvers/zod"
import { ContainerType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreateContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContainerCreated?: (containerId: string) => void
}

/**
 * Create Container Dialog Component
 *
 * @todo Enhance this dialog with the following features:
 * - Add tag creation and assignment
 * - Add container templates/presets
 * - Add icon picker with emoji/icon library
 * - Add container color theming
 * - Add bulk container creation
 * - Add container import/export functionality
 * - Add validation for duplicate container names
 * - Add container description templates
 * - Add advanced container settings (permissions, sharing, etc.)
 */
export function DashboardCreateContainerDialog({
  open,
  onOpenChange,
  onContainerCreated,
}: CreateContainerDialogProps) {
  const { toast } = useToast()
  const createContainerMutation = useCreateContainer()

  const form = useForm<ContainerDto>({
    resolver: zodResolver(containerDtoSchema),
    defaultValues: {
      name: "",
      icon: "📁",
      description: "",
      type: ContainerType.MIXED,
      tags: [],
    },
  })

  const handleCreateContainer = async (data: ContainerDto) => {
    try {
      const result = await createContainerMutation.mutateAsync(data)
      toast(`"${result.name}" has been created successfully.`, "success")
      form.reset()
      onOpenChange(false)

      // Notify parent component about the new container
      if (onContainerCreated) {
        onContainerCreated(result.id)
      }
    } catch (error) {
      console.error(error)
      toast("Failed to create container. Please try again.", "error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Container</DialogTitle>
          <DialogDescription>
            Create a new container to organize your items.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateContainer)}
            className="space-y-4"
          >
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="📁"
                        className="text-center text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Container name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select container type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LIST_CONTAINER_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          <div>
                            <p className="font-medium">
                              {ContainerEntity.convertContainerTypeToLabel(
                                value
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {ContainerEntity.convertContainerTypeToDescription(
                                value
                              )}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Optional description..."
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about this container.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContainerMutation.isPending}
              >
                {createContainerMutation.isPending
                  ? "Creating..."
                  : "Create Container"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
