from django import forms

class PizzaOrderForm(forms.Form):
    SIZE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]
    CRUST_CHOICES = [
        ('normal', 'Normal'),
        ('thin', 'Thin'),
        ('thick', 'Thick'),
        ('gluten_free', 'Gluten Free'),
    ]
    SAUCE_CHOICES = [
        ('tomato', 'Tomato'),
        ('bbq', 'BBQ'),
    ]
    CHEESE_CHOICES = [
        ('mozzarella', 'Mozzarella'),
        ('vegan', 'Vegan'),
        ('low_fat', 'Low Fat'),
    ]
    TOPPING_CHOICES = [
        ('pepperoni', 'Pepperoni'),
        ('chicken', 'Chicken'),
        ('ham', 'Ham'),
        ('pineapple', 'Pineapple'),
        ('peppers', 'Peppers'),
        ('mushrooms', 'Mushrooms'),
        ('onions', 'Onions'),
    ]

    size = forms.ChoiceField(choices=SIZE_CHOICES, widget=forms.RadioSelect, label="Size")
    crust = forms.ChoiceField(choices=CRUST_CHOICES, widget=forms.RadioSelect, label="Crust Type")
    sauce = forms.ChoiceField(choices=SAUCE_CHOICES, widget=forms.RadioSelect, label="Sauce")
    cheese = forms.ChoiceField(choices=CHEESE_CHOICES, widget=forms.RadioSelect, label="Cheese")
    toppings = forms.MultipleChoiceField(choices=TOPPING_CHOICES, widget=forms.CheckboxSelectMultiple, label="Toppings")
