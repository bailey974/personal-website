from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import PizzaOrderForm
from django.shortcuts import get_object_or_404
from .models import Order, PizzaSize, CrustType, Sauce, Cheese, Topping
from .forms import PizzaOrderForm

def index(request):
    return render(request, 'index.html')

def select_option(request):
    if request.method == "POST":
        form = PizzaOrderForm(request.POST)
        if form.is_valid():
            pizza_data = form.cleaned_data  # This should be a dictionary with keys: size, crust, sauce, cheese, toppings
            # Retrieve the current list of pizzas (or create an empty list if none exists)
            pizzas = request.session.get("pizzas", [])
            pizzas.append(pizza_data)
            request.session["pizzas"] = pizzas
            # Print debug information to the console
            print("DEBUG: Updated pizzas =", pizzas)
            
            # Depending on which button is clicked:
            if "add_another" in request.POST:
                # Remain on the pizza selection page to add another pizza
                return redirect("select_option")
            else:
                # Proceed to checkout/order details
                return redirect("order_details")
    else:
        form = PizzaOrderForm()
    return render(request, "select_options.html", {"form": form})



@login_required
def order_details(request):
    # Retrieve pizza data from session
    pizzas = request.session.get("pizzas", [])
    # Debug: Print out the session pizzas to your console
    print("DEBUG: pizzas =", pizzas)
    
    if request.method == "POST":
        # Retrieve form data (ensure your fields match your template)
        name = request.POST.get("name", "").strip()
        address = request.POST.get("address", "").strip()
        card_number = request.POST.get("card_number", "").strip()
        expiry_date = request.POST.get("expiry_date", "").strip()
        cvv = request.POST.get("cvv", "").strip()

        if not address:
            messages.error(request, "Please select your delivery address on the map.")
            return render(request, "order_details.html", {"pizzas": pizzas})

        # ... (process payment and create order)
        # For debugging purposes, you can simulate order creation:
        order = {
            "id": 123,  # fake order id for demonstration
            "submitted_at": "2025-02-10 12:00",
            "address": address,
            "pizzas": pizzas,
        }
        # Clear session pizzas if needed:
        request.session.pop("pizzas", None)
        # Redirect to a success page (or render a success template)
        return render(request, "order_success.html", {"order": order})
    
    return render(request, "order_details.html", {"pizzas": pizzas})

def custom_login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        print(f"Attempting login for: {username}")  # Debugging line
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            print("Login successful!")  # Debugging line
            return redirect("home")
        else:
            print("Invalid credentials!")  # Debugging line
            messages.error(request, "Invalid username or password.")
    
    return render(request, "login.html")

# views.py (continue)
@login_required
def order_success(request):
    order_id = request.session.get("order_id")
    if not order_id:
        messages.error(request, "No order found.")
        return redirect("home")
    
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    # Optionally remove the order_id from the session after retrieval:
    request.session.pop("order_id", None)
    
    return render(request, "order_success.html", {"order": order})

@login_required
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by("-submitted_at")
    return render(request, "order_history.html", {"orders": orders})

def register_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']
        
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Username already taken'})
        
        user = User.objects.create_user(username=username, password=password, email=email)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        
        return redirect('home')
    
    return render(request, 'register.html')

def logout_user(request):
    logout(request)
    return redirect('custom_login')

@login_required
def home_view(request):
    return render(request, 'home.html', {'user': request.user})

def check_login_status(request):
    if request.user.is_authenticated:
        return redirect('home')  # Redirect if logged in
    else:
        return redirect('custom_login')  # Redirect to login page