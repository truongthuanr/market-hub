from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    AttributeViewSet,
    ProductAttributeViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("variants", ProductVariantViewSet, basename="variant")
router.register("attributes", AttributeViewSet, basename="attribute")
router.register("product-attributes", ProductAttributeViewSet, basename="product-attribute")

urlpatterns = router.urls
