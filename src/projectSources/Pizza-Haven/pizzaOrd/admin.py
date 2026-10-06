from django.contrib import admin
from .models import PizzaSize, CrustType, Sauce, Cheese, Topping, Order

@admin.register(PizzaSize, CrustType, Sauce, Cheese, Topping)
class PizzaAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'size', 'crust', 'sauce', 'cheese', 'submitted_at')
    search_fields = ('user__username', 'size__name', 'crust__name')
