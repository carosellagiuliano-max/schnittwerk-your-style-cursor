import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

interface CartDialogProps {
  children: React.ReactNode;
}

const CartDialog = ({ children }: CartDialogProps) => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    const orderText = cartItems.map(item => 
      `${item.quantity}x ${item.name} - ${item.price}`
    ).join('\n');
    
    const total = `\nGesamtbetrag: CHF ${totalPrice.toFixed(2)}`;
    const message = `Hallo! Ich möchte folgende Produkte bestellen:\n\n${orderText}${total}`;
    
    const whatsappUrl = `https://wa.me/41788508595?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Einkaufswagen
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ihre ausgewählten Produkte
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Ihr Einkaufswagen ist leer</p>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <Badge variant="secondary" className="mt-1">
                          {item.price}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-foreground">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Gesamtbetrag:</span>
                  <span>CHF {totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Warenkorb leeren
                </Button>
                <Button
                  onClick={handleOrder}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Jetzt bestellen
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Die Bestellung wird per WhatsApp an uns gesendet. Sie können die Produkte im Salon abholen.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;