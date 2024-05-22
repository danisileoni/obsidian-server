create materialized view product_materialized as
select   
  info_product."id" AS info_product_id,
  product."id" AS product_id,
  product_image."id" AS product_image_id,
  platform."id" AS platform_id, 
  sale."id" as sale_id,
  info_product.title,
  info_product.description,
  info_product.slug,
  info_product.tags,
  product."pricePrimary",
  product."priceSecondary",
  product.price,
  product."createAt",
  platform."namePlatform",
  sale.sale,
  product_image.url,
  sale."salePrimary",
  sale."saleSecondary",
  sale."salePrice"
from info_product
left join product on info_product."id" = product."infoProductId"
left join product_image on info_product."id" = product_image."infoProductId" 
left join platform on product."platformId" = platform."id"
left join sale on sale."productId" = product."id" 
order by product."createAt" desc;