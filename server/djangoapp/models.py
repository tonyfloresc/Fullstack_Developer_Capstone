from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator

# ---------- CarMake ----------
class CarMake(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # (Opcional) otros campos de tu preferencia, por ejemplo:
    # country = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        # Representación legible del objeto
        return self.name


# ---------- CarModel ----------
class CarModel(models.Model):
    # Relación muchos-a-uno con CarMake (un make puede tener muchos modelos)
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)

    # Dealer Id (entero) que referencia al dealer en la base de datos externa
    dealer_id = models.IntegerField()

    name = models.CharField(max_length=100)

    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV',   'SUV'),
        ('WAGON', 'Wagon'),
        # Puedes añadir más si quieres:
        # ('COUPE', 'Coupe'), ('TRUCK', 'Truck'),
    ]
    type = models.CharField(max_length=10, choices=CAR_TYPES, default='SUV')

    # Año (usa el rango sugerido por la muestra)
    year = models.IntegerField(
        default=2023,
        validators=[
            MaxValueValidator(2023),
            MinValueValidator(2015)
        ]
    )

    # (Opcional) otros campos
    # trim = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        # Imprime "Make Model" para que sea claro
        return f"{self.car_make} {self.name}"

