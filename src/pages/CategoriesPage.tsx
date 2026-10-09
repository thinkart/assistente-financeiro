import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryBadge } from '@/features/categories/CategoryBadge'
import { CategoryForm } from '@/features/categories/CategoryForm'
import { DeleteCategoryDialog } from '@/features/categories/DeleteCategoryDialog'
import { categoryTypeOptions } from '@/features/categories/schemas'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/use-categories'
import type { Category, CategoryInput, TransactionType } from '@/types'

const typeLabelOf = (type: TransactionType) =>
  categoryTypeOptions.find((option) => option.value === type)?.label ?? type

export function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data: categories = [], isPending, isError, refetch } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const handleOpenCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditing(null)
  }

  const persist = async (input: CategoryInput) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input })
        toast.success('Categoria atualizada!')
      } else {
        await createMutation.mutateAsync(input)
        toast.success('Categoria criada!')
      }
    } catch (error) {
      toast.error('Não foi possível salvar a categoria')
      throw error
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Categoria excluída!')
    } catch (error) {
      toast.error('Não foi possível excluir a categoria')
      throw error
    }
  }

  const renderActions = (category: Category) => (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleOpenEdit(category)}
      >
        Editar
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => setDeleteTarget(category)}
      >
        Excluir
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Categorias</h2>
        <Button type="button" onClick={handleOpenCreate}>
          + Nova categoria
        </Button>
      </div>

      {isPending && (
        <p
          role="status"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          Carregando categorias…
        </p>
      )}

      {isError && (
        <div className="space-y-3 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar as categorias.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isPending && !isError && categories.length === 0 && (
        <p
          role="status"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          Nenhuma categoria encontrada.
        </p>
      )}

      {!isPending && !isError && categories.length > 0 && (
        <>
          <div className="hidden min-[720px]:block">
            <Table aria-label="Categorias">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="odd:bg-muted/40">
                    <TableCell>
                      <CategoryBadge
                        categoryId={category.id}
                        name={category.name}
                      />
                    </TableCell>
                    <TableCell>{typeLabelOf(category.type)}</TableCell>
                    <TableCell className="text-right">
                      {renderActions(category)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul
            aria-label="Lista de categorias (mobile)"
            className="space-y-3 min-[720px]:hidden"
          >
            {categories.map((category) => (
              <li key={category.id}>
                <Card>
                  <CardContent className="space-y-3 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <CategoryBadge
                        categoryId={category.id}
                        name={category.name}
                      />
                      <span className="text-muted-foreground">
                        {typeLabelOf(category.type)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(category)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        onClick={() => setDeleteTarget(category)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <CategoryForm
        open={formOpen}
        category={editing}
        onOpenChange={handleFormOpenChange}
        onSubmit={persist}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
