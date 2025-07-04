import React from "react";
import { Clock, Star, Plus, Edit, Trash2, Minus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  prepTime: number;
  rating: number;
  available: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  variant?: "customer" | "admin";
  onAddToCart?: (item: MenuItem) => void;
  onRemoveFromCart?: (itemId: string) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  onItemClick?: (item: MenuItem) => void;
  cartQuantity?: number;
}

const MenuItemCard = ({
  item,
  variant = "customer",
  onAddToCart,
  onRemoveFromCart,
  onEdit,
  onDelete,
  onToggleAvailability,
  onItemClick,
  cartQuantity = 0,
}: MenuItemCardProps) => {
  if (variant === "admin") {
    return (
      <Card className="overflow-hidden bg-white rounded-3xl shadow-lg border-0">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge
              variant={item.available ? "default" : "secondary"}
              className={item.available ? "bg-green-500" : "bg-gray-500"}
            >
              {item.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <span className="font-bold text-lg text-green-600">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{item.prepTime} min</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span>{item.rating}</span>
            </div>
            <Badge variant="outline" className="capitalize">
              {item.category}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAvailability?.(item.id)}
            className="flex-1"
          >
            {item.available ? "Mark Unavailable" : "Mark Available"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Customer variant - Popular items (square format)
  if (variant === "customer") {
    return (
      <Card
        className="overflow-hidden bg-white rounded-3xl shadow-lg border-0 w-full relative cursor-pointer"
        onClick={() => onItemClick?.(item)}
      >
        <div className="aspect-square relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs">{item.rating}</span>
              </div>
              <div className="font-bold text-white text-sm">
                ${item.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{item.prepTime} min</span>
            </div>
            {cartQuantity > 0 ? (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  onClick={() => onRemoveFromCart?.(item.id)}
                  className="bg-gray-900 hover:bg-black text-white rounded-full w-8 h-8 p-0 flex items-center justify-center"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold min-w-[24px] text-center bg-gray-100 rounded-full px-2 py-1">
                  {cartQuantity}
                </span>
                <Button
                  size="sm"
                  onClick={() => onAddToCart?.(item)}
                  className="bg-gray-900 hover:bg-black text-white rounded-full w-8 h-8 p-0 flex items-center justify-center"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(item);
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-4 py-2 text-xs font-medium"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

// List variant for customer menu (horizontal layout)
export const MenuItemListCard = ({
  item,
  onAddToCart,
  onRemoveFromCart,
  onItemClick,
  cartQuantity = 0,
}: {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  onRemoveFromCart?: (itemId: string) => void;
  onItemClick?: (item: MenuItem) => void;
  cartQuantity?: number;
}) => {
  return (
    <Card
      className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 w-full cursor-pointer"
      onClick={() => onItemClick?.(item)}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{item.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{item.prepTime} min</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold text-gray-800 text-lg">
                  ${item.price.toFixed(2)}
                </div>
                {cartQuantity > 0 ? (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      onClick={() => onRemoveFromCart?.(item.id)}
                      className="bg-gray-900 hover:bg-black text-white rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold min-w-[24px] text-center bg-gray-100 rounded-full px-2 py-1">
                      {cartQuantity}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart?.(item)}
                      className="bg-gray-900 hover:bg-black text-white rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart?.(item);
                    }}
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded-full w-8 h-8 p-0 flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MenuItemCard;
