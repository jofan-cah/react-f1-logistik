// src/components/ProductStockTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Settings,
  AlertTriangle,
  BarChart3,
  Clock
} from 'lucide-react';
import { useStock } from '../store/useStock';
import { useCategoryStore } from '../store/useCategoryStore';
import { Product } from '../types/product.types';
import { CreateStockMovementRequest } from '../types/stock.types';
import Badge from './ui/Badge';

interface ProductStockTabProps {
  product: Product;
}

interface QuickStockActionProps {
  categoryId: number;
  currentStock: number;
  onStockAction: (data: CreateStockMovementRequest) => void;
  isLoading: boolean;
}

const QuickStockAction: React.FC<QuickStockActionProps> = ({ 
  categoryId, 
  currentStock, 
  onStockAction, 
  isLoading 
}) => {
  const [actionType, setActionType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || parseInt(quantity) <= 0) return;

    onStockAction({
      category_id: categoryId,
      movement_type: actionType,
      quantity: parseInt(quantity),
      notes: notes.trim() || undefined,
      reference_type: 'manual'
    });

    // Reset form
    setQuantity('');
    setNotes('');
    setShowForm(false);
  };

  const getActionLabel = () => {
    switch (actionType) {
      case 'in': return 'Stock In';
      case 'out': return 'Stock Out';
      case 'adjustment': return 'Adjust Stock';
      default: return 'Stock Action';
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'in': return 'bg-green-600 hover:bg-green-700';
      case 'out': return 'bg-red-600 hover:bg-red-700';
      case 'adjustment': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'in': return <Plus className="w-4 h-4" />;
      case 'out': return <Minus className="w-4 h-4" />;
      case 'adjustment': return <Settings className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!showForm) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => { setActionType('in'); setShowForm(true); }}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Stock In
        </button>
        <button
          onClick={() => { setActionType('out'); setShowForm(true); }}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          <Minus className="w-4 h-4 mr-1" />
          Stock Out
        </button>
        <button
          onClick={() => { setActionType('adjustment'); setShowForm(true); }}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Settings className="w-4 h-4 mr-1" />
          Adjust
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{getActionLabel()}</h4>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      <div className="flex space-x-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            {actionType === 'adjustment' ? 'New Stock Level' : 'Quantity'}
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={actionType === 'adjustment' ? `Current: ${currentStock}` : 'Enter quantity'}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Add notes for this stock movement..."
        />
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isLoading || !quantity || parseInt(quantity) <= 0}
          className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${getActionColor()}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="mr-2">{getActionIcon()}</span>
          )}
          {isLoading ? 'Processing...' : getActionLabel()}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const ProductStockTab: React.FC<ProductStockTabProps> = ({ product }) => {
  const {
    stockMovements,
    recentMovements,
    isLoading,
    error,
    isCreatingMovement,
    createStockMovement,
    fetchStockMovements,
    fetchRecentMovements,
    setFilters,
    clearError
  } = useStock();

  const {
    categories,
    fetchCategories
  } = useCategoryStore();

  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  // Find category for this product
  const productCategory = categories.find(cat => cat.id === product.category_id);

  useEffect(() => {
    // Load categories if not already loaded
    if (categories.length === 0) {
      fetchCategories();
    }

    // Load stock movements for this category
    if (product.category_id) {
      setFilters({ category_id: product.category_id });
      fetchStockMovements(1, 10);
      fetchRecentMovements(5);
    }
  }, [product.category_id, categories.length]);

  const handleStockAction = async (data: CreateStockMovementRequest) => {
    try {
      const success = await createStockMovement(data);
      if (success) {
        // Refresh data after successful action
        fetchStockMovements(1, 10);
        fetchRecentMovements(5);
        // Refresh categories to get updated stock levels
        fetchCategories();
      }
    } catch (error) {
      console.error('Stock action failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = () => {
    if (!productCategory) return null;
    
    const { current_stock, min_stock, reorder_point, is_low_stock } = productCategory;
    
    if (current_stock === 0) {
      return { status: 'Out of Stock', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    } else if (is_low_stock) {
      return { status: 'Low Stock', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    } else if (current_stock <= min_stock) {
      return { status: 'Below Minimum', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
    } else {
      return { status: 'In Stock', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'out':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'adjustment':
        return <Settings className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge type="success" text="Stock In" />;
      case 'out':
        return <Badge type="danger" text="Stock Out" />;
      case 'adjustment':
        return <Badge type="primary" text="Adjustment" />;
      default:
        return <Badge type="gray" text={type} />;
    }
  };

  // Check if category tracks stock
  if (!productCategory?.has_stock) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Stock Tracking</h3>
          <p className="mt-1 text-sm text-gray-500">
            This product category does not track stock levels.
          </p>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Stock Overview</h3>
              {stockStatus && (
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${stockStatus.bgColor} ${stockStatus.textColor}`}>
                  {stockStatus.status}
                </span>
              )}
            </div>

            {productCategory && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{productCategory.current_stock}</div>
                  <div className="text-sm text-gray-500">Current Stock</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{productCategory.min_stock}</div>
                  <div className="text-sm text-gray-500">Minimum Stock</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{productCategory.max_stock}</div>
                  <div className="text-sm text-gray-500">Maximum Stock</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{productCategory.reorder_point}</div>
                  <div className="text-sm text-gray-500">Reorder Point</div>
                </div>
              </div>
            )}

            {/* Stock Alert */}
            {productCategory?.is_low_stock && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Low Stock Alert</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Current stock ({productCategory.current_stock} {productCategory.unit}) is below the reorder point ({productCategory.reorder_point} {productCategory.unit}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stock Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stock Actions</h3>
            <QuickStockAction
              categoryId={product.category_id}
              currentStock={productCategory?.current_stock || 0}
              onStockAction={handleStockAction}
              isLoading={isCreatingMovement}
            />
          </div>

          {/* Recent Movements */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
              <button
                onClick={() => fetchStockMovements(1, 10)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View All
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recentMovements.length > 0 ? (
              <div className="space-y-3">
                {recentMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getMovementTypeIcon(movement.movement_type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          {getMovementTypeBadge(movement.movement_type)}
                          <span className="text-sm font-medium text-gray-900">
                            {movement.quantity} {productCategory?.unit}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {movement.before_stock} → {movement.after_stock} {productCategory?.unit}
                        </div>
                        {movement.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {formatDate(movement.movement_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.reference_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>No recent stock movements found</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Details Sidebar */}
        <div className="space-y-6">
          {/* Category Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Category Details</h4>
            {productCategory ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="text-gray-900">{productCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Code:</span>
                  <span className="text-gray-900">{productCategory.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit:</span>
                  <span className="text-gray-900">{productCategory.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stock Tracking:</span>
                  <span className="text-green-600">Enabled</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading category information...</p>
            )}
          </div>

          {/* Stock Statistics */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Stock Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Movements:</span>
                <span className="text-gray-900">{stockMovements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock In:</span>
                <span className="text-green-600">
                  {stockMovements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + m.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock Out:</span>
                <span className="text-red-600">
                  {stockMovements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + m.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adjustments:</span>
                <span className="text-blue-600">
                  {stockMovements.filter(m => m.movement_type === 'adjustment').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStockTab;