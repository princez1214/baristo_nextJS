/* eslint-disable no-param-reassign */
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import queryString from 'query-string';
import { isNil, isUndefined, findLastKey } from 'lodash';
import axios from '../../../lib/axios';
import BaseLoader from '../../base/BaseLoader';
import ChoicesSection from '../topping/ChoicesSection';
import { toggleConfirmProductModal, toggleCustomizeProductModal, setOrderItems, setComboOrderItems } from '../../../store/actions/cart.actions';

const ProductModalCustomizeMeal = ({ isActive, productDetails, close, productType }) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(['common']);
  const { currency } = useSelector((state) => state.root.settings);
  const { selectedPrice, selectedProductChoices, orderItems, comboOrderItems, currentCustomizeProductMode, orderDeliveryType } = useSelector((state) => state.cart);
  const { id: branchId } = useSelector((state) => state.root.currentBranch);
  const { loyaltyPointsBase } = useSelector((state) => state.root.settings);

  // eslint-disable-next-line no-unused-vars
  const [choiceGroups, setChoiceGroups] = useState([]);
  // const [isValidChoices, setIsValidChoices] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const boundToggleConfirmProductModal = () => dispatch(toggleConfirmProductModal());
  const boundToggleCustomizeProductModal = () => dispatch(toggleCustomizeProductModal());
  const boundSetOrderItems = (items) => dispatch(setOrderItems(items));
  const boundSetComboOrderItems = (items) => dispatch(setComboOrderItems(items));

  const calcFinalPrice = (price) => {
    if (isNil(price)) return 0;

    if (price.mealSettings.length === 0) return price.price;

    const mealSettings = price.mealSettings[0];

    if (!mealSettings.applyDiscount) return price.price;

    if (mealSettings.discountType === 'Fixed') return price.price - mealSettings.discount;

    if (mealSettings.discountType === 'Percentage') return price.price - (mealSettings.discount * price.price / 100);

    return price.price;
  }

  const calcSelectedChoicesPrice = (choices) => {
    let total = 0;
    choices.forEach(choice => {
      total += choice.price * choice.quantity;
    });
    return total;
  }

  /**
   * Generate query object
   *
   * @return {String}
   */
  const generateQueryObject = () => {
    if (productType === 'combo') {
      return queryString.stringify({
        comboId: productDetails.id,
        culture: i18n.language,
        branchId,
      });
    }
    return queryString.stringify({
      mealId: productDetails.id,
      culture: i18n.language,
      branchId,
    });
  };

  /**
   * Fetch product details
   *
   * @param {Array} ids
   */
  const getMealToppings = async () => {
    setIsLoading(true);
    const query = generateQueryObject();
    try {
      const url = productType === 'combo' ? 'combo-toppings' : 'meal-toppings';

      const response = await axios.get(
        `customer/web/meals-service/${url}?${query}`,
      );

      setChoiceGroups(response.data.result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add an item to the cart
   */
  const addToCart = async () => {
    // detect if meal or combo
    const isMeal = !isUndefined(productDetails.mealPrices);

    let currentQuantity;
    if (isMeal) {
      // get current quantity
      currentQuantity = orderItems.filter(item => {
        return item.mealId === productDetails.id;
      })[0]?.quantity ?? 0;
      
      let items = [];
      if (currentQuantity === 0) {
        items = [...orderItems, {
          mealId: productDetails.id,
          mealPriceId: selectedPrice.id,
          quantity: currentQuantity + 1,
          orderItemChoices: selectedProductChoices
        }];
      } else {
        items = orderItems.map(item => {
          if (item.mealId === productDetails.id) {
            item.quantity = currentQuantity + 1;
          }
          return item;
        });
      }

      boundSetOrderItems(items);
    } else {
      // get current quantity
      currentQuantity = comboOrderItems.filter(item => {
        return item.mealId === productDetails.id;
      })[0]?.quantity ?? 1;

      console.log(currentQuantity);
    }

    // create cart
    setIsLoadingAll(true);
    try {
      const response = await axios.post('/customer/web/checkout-service/order', {
        orderDeliveryType,
        isTest: true,
        branchId,
        orderItems,
        orderAddressFK: {
          "customerName": "Some Customer Name",
          "no": "200",
          "street": "Lehenmattstrasse",
          "city": "Basel",
          "postalCodeId": 240,
          "countryId": 1
        }
      });

      console.log(response);
    } catch (error) {
      console.error(error);
      alert('An error happend');
    } finally {
      setIsLoadingAll(false);
    }
  }

  useEffect(() => {
    if (!isActive) return;

    getMealToppings();
  }, [productDetails, isActive]);

  if (!isActive) return '';

  return (
    <div>
      <div className="customize-food show">
        <div className="customize-main relative">
          {isLoadingAll && <BaseLoader />}
          <div className="customize-top relative">
            <h2 className="title">
              <span>{t('build_your_meal')}</span>
            </h2>
            <button type="button" className="close close-customize" onClick={close}>
              <i className="ti-close" />
            </button>
          </div>
          <div className="flex-between">
            <div className="flex-left">
              <h3 className="font-weight-bold font-48 mgb-10">
                {productDetails.title}
              </h3>
              <div className="product-index">
                <ul className="flex-center">
                  <li>
                    <span>
                      <img
                        src={productDetails.category.imagePath}
                        alt={productDetails.category.category}
                        style={{ height: '1.5rem' }}
                      />
                    </span>
                    {productDetails.category.category}
                  </li>
                  <li>
                    <span>
                      <img src="images/icon/icon-dish.svg" alt="" title="" />
                    </span>
                    {`${t('prepare')} ${productDetails.preparationDuration} ${t(
                      'minutes',
                    )}`}
                  </li>
                  {loyaltyPointsBase === 'POINTSBASE-ITEM' &&
                    <li>
                      {`${t('loyalty_points')}`}
                    </li>
                  }
                </ul>
              </div>
            </div>
            <div className="flex-right">
              <button
                type="button"
                className="btn btn-white btn-h50 font-20 font-demi"
                onClick={boundToggleConfirmProductModal}
              >
                <i className="ti-plus mgr-15" /> {t('meal')}
              </button>
            </div>
          </div>
          <div className="menu-money-2 mgt-50">
            <div className="row">
              <div className="col-md-6">
                <div className="total-menu">
                  {/* item price  */}
                  <div className="flex-center-between mgb-10">
                    <span className="font-24 text-ghi">{t('order_total')}</span>
                    <span className="font-weight-bold font-36 text-green">
                      {`${currency} ${selectedPrice.price}`}
                    </span>
                  </div>
                  {/* choices  */}
                  <div className="flex-center-between mgb-10">
                    <span className="font-24 text-ghi">{t('choices_total')}</span>
                    <span className="font-weight-bold font-36 text-green">
                      {`${currency} ${calcSelectedChoicesPrice(selectedProductChoices)}`}
                    </span>
                  </div>
                  {/* discount  */}
                  {selectedPrice.mealSettings[0]?.discount &&
                    <div className="flex-center-between mgb-10">
                      <span className="font-24 text-ghi">{t('discount')}</span>
                      <span className="font-weight-bold font-36 text-green">
                        {selectedPrice.mealSettings[0]?.discountType ===
                          'Fixed'
                          ? `-${currency} `
                          : '-% '}
                        {selectedPrice.mealSettings[0]?.discount}
                      </span>
                    </div>
                  }
                  <div className="flex-center-end">
                    <span className="font-weight-bold font-56 text-yellow">
                      {calcFinalPrice(selectedPrice) + calcSelectedChoicesPrice(selectedProductChoices)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="total-promotion">
                  <p className="font-24 font-medium mgb-10">{t('optional')}</p>
                  <div className="font-24 mgb-30">
                    {selectedProductChoices.map((selectedChoice, index) => {
                      return <span key={selectedChoice.id}>{`X${selectedChoice.quantity} ${selectedChoice.choiceItem} ${index === selectedProductChoices.length - 1 ? '' : ', '}`}</span>
                    })}
                    {selectedProductChoices.length === 0 &&
                      <div className="text-center py-10 desc font-20 mgb-20">
                        <p>{t('no_toppings_selected')}</p>
                      </div>
                    }
                  </div>
                  {/* add to cart button  */}
                  <button
                    type="button"
                    className="btn btn-block btn-yellow btn-h80 font-24 font-weight-bold"
                    onClick={addToCart}
                  >
                    <span className="mgr-15">{t('add_to_cart')}</span>
                    <i className="ti-arrow-right" />
                  </button>
                  {/* discard button  */}
                  <button
                    type="button"
                    className="d-flex justify-content-center btn-default mx-auto mt-3 text-center"
                    onClick={boundToggleCustomizeProductModal}
                  >
                    <span className="mgr-15">{t('discard')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="optional mgt-50">
            {isLoading && <BaseLoader />}
            {!isLoading && choiceGroups.length !== 0 &&
              choiceGroups.map(choiceGroup => {
                return (
                  <div key={choiceGroup.id}>
                    <h2 className="title text-left font-36 mgb-40">
                      <span>{choiceGroup.choiceGroup}</span>
                    </h2>
                    <ChoicesSection choiceGroup={choiceGroup} />
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
};

ProductModalCustomizeMeal.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default ProductModalCustomizeMeal;
