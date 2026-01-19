import os
import uuid

from django.db import models


def category_image_path(instance: "Category", filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower() or ".jpg"
    slug = instance.slug or "category"
    return f"categories/{slug}-{uuid.uuid4().hex}{ext}"


class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    image = models.ImageField(upload_to=category_image_path, blank=True, null=True)
    parent = models.ForeignKey(
        "self", null=True, blank=True, related_name="children", on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    seller_id = models.BigIntegerField()
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    category = models.ForeignKey(
        Category, null=True, blank=True, related_name="products", on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["seller_id", "slug"],
                name="uniq_product_seller_slug",
            )
        ]

    def __str__(self) -> str:
        return self.name


class ProductVariant(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    product = models.ForeignKey(Product, related_name="variants", on_delete=models.CASCADE)
    sku = models.CharField(max_length=64)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "sku"],
                name="uniq_variant_product_sku",
            )
        ]

    def __str__(self) -> str:
        return self.sku


class Attribute(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:
        return self.name


class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, related_name="attributes", on_delete=models.CASCADE)
    attribute = models.ForeignKey(Attribute, related_name="product_attributes", on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ("product", "attribute")

    def __str__(self) -> str:
        return f"{self.product_id}:{self.attribute_id}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    url = models.URLField(max_length=1024)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self) -> str:
        return self.url
