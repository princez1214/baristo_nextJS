import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  setProductsBatch,
  setCurrentActiveProductId,
  setCurrentActiveProductIndex,
  setProductDetailsTrigger,
  setMenuDetailsTrigger
} from '../../store/actions/cart.actions';
import ProductCard from '../../components/product/ProductCard';
import ProductChefItemCardV2 from '../../components/product/ProductChefItemCardV2';


const ProductsContainer = ({ products, productCardType }) => {
  const dispatch = useDispatch();

  const boundSetProductsBatch = (productsBatch) =>
    dispatch(setProductsBatch(productsBatch));

  const boundSetCurrentActiveProductId = (id) =>
    dispatch(setCurrentActiveProductId(id));

  const boundSetCurrentActiveProductIndex = (index) =>
    dispatch(setCurrentActiveProductIndex(index));

  const boundSetProductsDetailsTrigger = () => {
    dispatch(setProductDetailsTrigger());
  }

  const boundSetMenuDetailsTrigger = () => {
    dispatch(setMenuDetailsTrigger());
  }

  const openMoreDetailsModal = (id, index) => {
    // set the products batch 
    boundSetProductsBatch(products);
    // set the current active product id
    boundSetCurrentActiveProductId(id);
    // set the current active product index
    boundSetCurrentActiveProductIndex(index);
    // if v3 type
    if (productCardType === 'v3') {
      boundSetMenuDetailsTrigger();
    } else {
      // trigger the product details changes
      boundSetProductsDetailsTrigger();
    }
  };

  if (!_.isArray(products)) return '';
  return (
    <div className="col-12">
      <div className="row">
        {products.map((product, index) => (
          <div className="col-md-4" key={product.id}>
            {productCardType === 'v2' ?
              <ProductChefItemCardV2
                openMoreDetails={() => openMoreDetailsModal(product.id, index)}
                product={product}
              />
              :
              <ProductCard
                openMoreDetails={() => openMoreDetailsModal(product.id, index)}
                product={product}
              />
            }
          </div>
        ))}
      </div>
    </div>
  );
};

ProductsContainer.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  products: PropTypes.array.isRequired,
};

export default ProductsContainer;
