# models.py
from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True)

    def __str__(self):
        return self.user.username

class PizzaSize(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class CrustType(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Sauce(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Cheese(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Topping(models.Model):
    name = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    size = models.ForeignKey(PizzaSize, on_delete=models.CASCADE, null=True, blank=True)
    crust = models.ForeignKey(CrustType, on_delete=models.CASCADE, null=True, blank=True)
    sauce = models.ForeignKey(Sauce, on_delete=models.CASCADE, null=True, blank=True)
    cheese = models.ForeignKey(Cheese, on_delete=models.CASCADE, null=True, blank=True)
    # Add the address field here:
    address = models.CharField(max_length=255, blank=True, null=True)
    toppings = models.ManyToManyField(Topping, blank=True)  # Remove null=True for ManyToManyField
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Order {self.id} by {self.user.username if self.user else 'Guest'}"
