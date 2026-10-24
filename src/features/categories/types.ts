import type { CategoryColor, CategoryIcon } from '../../config/category-options'

export type CategoryInput = {
	name: string
	description: string | null
	color: CategoryColor
	icon: CategoryIcon
}
export type Category = CategoryInput & { id: string }
export type CategorySummary = Category & { transaction_count: number }
