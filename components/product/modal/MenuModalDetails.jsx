/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { isNil, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import BaseLoader from '../../base/BaseLoader';
import BaseDiscountPill from '../../base/BaseDiscountPill';
import { setDeliveryType, setSelectedPrice } from '../../../store/actions/cart.actions';

const MealPrice = ({ price, onClick, isSelected }) => {
  const { discountType } = price.mealSettings[0] && price.mealSettings[0]
  const { currency } = useSelector((state) => state.root.settings);
  console.log(price, discountType, isSelected, "size----")
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
  return (<div className="delevery-pickup" style={{ cursor: 'pointer', opacity: isSelected ? 1 : 0.4 }}>
    <span
      className="font-weight-bold"
      style={{
        whiteSpace: 'nowrap',
        fontSize: '1rem'
      }}
    >
      {selectMealSize(discountType, currency, price)}

    </span>
  </div>)
}

const selectMealSize = (discountType, currency, price) => {
  if (discountType === "Fixed") {
    return <span className="discount-fixed inflex-center-center btn-gray btn-bgLeft" style={{ backgroundColor: 'transparent', zIndex: '100' }}>{`${currency} ${price.price} - ${price.size}`}</span>
  } else if (discountType === "None") {
    return <span className="" style={{ backgroundColor: 'transparent', zIndex: '100' }}>{`${currency} ${price.price} - ${price.size}`}</span>
  } else {
    return <span className="discount-percentage  inflex-center-center btn-gray btn-bgLeft" style={{ backgroundColor: 'transparent', zIndex: '100' }}>{`${currency} ${price.price} - ${price.size}`}</span>
  }
}
// 251 175 2
const DeliveryTypeSwitch = ({ deliveryType, onChange }) => {
  const types = ['Delivery', 'PickUp'];
  return (<div className = "row">
      {types.map((type) => {
        return (
          <div className="col-md-6 col-sm-12" style={{ display: "flex", flexDirection: 'row', justifyContent: 'flex-start' }}>
          <button style={{ marginBottom: "50px" }} onClick={() => onChange(type)} type="button" key={type} 
          className={`px-5 mr-5 btn btn-primary deleverybutton inflex-center-center btn-h46 ${deliveryType === type? "btn-yellow":"btn-gray"}`}>
            <div style={{opacity: deliveryType === type ? 1 : 0.4, fontWeight: 900 }}>
              {type}
            </div>
          </button>
          </div>)
      })
      }
    </div>
  )
}

function compare(a, b) {
  if (a.price < b.price) {
    return 1
  }
  if (a.price > b.price) {
    return -1
  }
  return 0;
}

const MenuModalDetails = ({
  close,
  isActive,
  isLoading,
  productDetails,
  order,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['common']);
  const { currency } = useSelector((state) => state.root.settings);
  const { deliveryType, selectedPrice, orderItems, comboOrderItems } = useSelector((state) => state.cart);
  const { mealPrices } = productDetails;
  const { loyaltyPointsBase } = useSelector((state) => state.root.settings);
  const boundSetDeliveryType = (type) => dispatch(setDeliveryType(type));
  const boundSetSelectedPrice = (price) => dispatch(setSelectedPrice(price));
  const [nonePrice, setNonePrice] = useState()
  const selectPrice = (id) => {
    if (selectedPrice.id === id) return;

    boundSetSelectedPrice(mealPrices.filter(price => price.id === id)[0]);
  }
  const calcFinalPrice = (price) => {
    if (isNil(price)) return 0;

    if (price.mealSettings && price.mealSettings.length === 0) return price.price;

    const mealSettings = price.mealSettings && price.mealSettings[0];

    if (mealSettings && !mealSettings.applyDiscount) return price.price;

    if (mealSettings && mealSettings.discountType === 'Fixed') return price.price - mealSettings.discount;

    if (mealSettings && mealSettings.discountType === 'Percentage') return price.price - (mealSettings.discount * price.price / 100);

    return price.price;
  }

  useEffect(() => {
    if (mealPrices && mealPrices.length > 0) {
      mealPrices.sort(compare)
      for (let mealprice in mealPrices) {
        if (mealPrices[mealprice].mealSettings[0].discountType == "None") {
          console.log("noneprice", typeof (mealPrices[mealprice].price))
          console.log(typeof (calcFinalPrice(selectedPrice)), "noneprice")
          console.log(Number(calcFinalPrice(selectedPrice)) === Number(mealPrices[mealprice].price), "noneprice")
          return setNonePrice(mealPrices[mealprice].price)
        }
      }
    }
  }, [mealPrices])

  useEffect(() => {
    if (isNil(mealPrices) || isEmpty(mealPrices)) return;

    boundSetSelectedPrice(mealPrices[0]);
  }, []);

  useEffect(() => {
    if (isNil(mealPrices) || isEmpty(mealPrices)) return;

    boundSetSelectedPrice(mealPrices.filter(price => price.menuPriceOption === deliveryType)[0]);
  }, [deliveryType, mealPrices])

  if (!isActive) return '';
  if (isNil(productDetails)) return '';

  const onClose = () => {
    close();
    window.location.hash = ""
  }

  console.log(mealPrices, "product")

  return (
    <div>
      <div className="modal fade full-box show" id="product-detail">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="product-details">
              <button type="button" className="close" onClick={onClose}>
                <i className="ti-close" />
              </button>
              <div className="detail-slider">
                {isLoading && <BaseLoader />}
                {!isLoading && (
                  <div className="item">
                    <div className="detail-wrapper flex">
                      <div className="product-gallery d-flex justify-content-center align-items-center">
                        <img
                          src={productDetails.thumbnail}
                          alt={productDetails.thumbnail}
                        />
                      </div>
                      <div className="product-right">
                        <div className="product-detail d-flex flex-column justify-content-between min-h-full">
                          <div>
                            <h1>{productDetails.title}</h1>
                            <p className="font-20 mgt-10 mgb-20">
                              Pizza with sea flavor, make you feel the sea
                            </p>
                            <div className="desc">
                              {productDetails.description}
                            </div>
                            <div className="product-index">
                              <ul className="flex-center">
                                <li>
                                  <span>
                                    <img
                                      style={{ height: '1.5rem' }}
                                      src={productDetails.category.imagePath}
                                      alt={productDetails.category.category}
                                    />
                                  </span>
                                  {productDetails.category.category}
                                </li>
                                <li>
                                  <span>
                                    <img
                                      src="images/icon/icon-dish.svg"
                                      alt=""
                                    />
                                  </span>
                                  {`${t('prepare')} ${
                                    productDetails.preparationDuration
                                    } ${t('minutes')}`}
                                </li>
                                {loyaltyPointsBase === 'POINTSBASE-ITEM' &&
                                  <li>
                                    {`${t('loyalty_points')}`}
                                  </li>
                                }
                              </ul>
                            </div>
                            {!isNil(productDetails.ingredients) && (
                              <div className="product-component flex">
                                <span>
                                  <img
                                    src="images/icon/icon-nutrition.svg"
                                    alt=""
                                  />
                                  {t('components')}
                                </span>
                                <div>{productDetails.ingredients}</div>
                              </div>
                            )}
                          </div>
                          <div className="group-price">
                            {/* show delivery switch if cart is empty  */}
                            {orderItems.length === 0 && comboOrderItems.length === 0 &&
                              <div className="form-inline">
                                <div className="container">
                                  <div style={{ marginTop: '20px', marginBottom: '20px', fontSize: '18px' }}>
                                    <span>Do you want to get {productDetails.title} by delivery or pickup?</span>
                                  </div>
                                    <DeliveryTypeSwitch deliveryType={deliveryType} onChange={(type) => boundSetDeliveryType(type)} />
                                </div>
                              </div>
                            }
                            <div className="form-inline">
                              {
                                productDetails.offeredInSizes && <div className="container">
                                  <div style={{ marginTop: '40px', marginBottom: '20px', fontSize: '18px' }}>
                                    <span>Please select the meal size.</span>
                                  </div>
                                  <div className="row">
                                      {mealPrices.map((price, index) => {
                                        console.log(price, "size--")
                                        if (price.menuPriceOption !== deliveryType) return <div></div>;
                                        return <div className="col-md-6 col-sm-12 mealSize" style={{ display: "flex", flexDirection: 'row', justifyContent: 'flex-start' }}>
                                          <button type="button" style={{ padding: "0px", marginBottom: "20px" }}
                                          onClick={() => selectPrice(price.id)} isSelected={selectedPrice.id === price.id}
                                          className={`px-5 mr-5 btn btn-primary inflex-center-center meal-size-button ${selectedPrice.id === price.id? "btn-yellow":"btn-gray"} btn-h46`}>
                                          <MealPrice key={index} price={price} isSelected={selectedPrice.id === price.id} />
                                        </button>
                                        </div>
                                      })}
                                  </div>
                                </div>
                              }
                            </div>
                            {productDetails.offeredInSizes &&
                              <div className="row">
                                <div className="col-md-5">
                                  {mealPrices &&
                                    mealPrices[0].price == calcFinalPrice(selectedPrice) ?
                                    <div>
                                      <div className="old-price">{`${currency} ${mealPrices && mealPrices[0].price}`}</div>
                                      <div className="old-price"></div>
                                    </div>
                                     :
                                    <div>
                                      <div className="old-price"><span>{`${currency} ${mealPrices && mealPrices[0].price}`}</span></div>
                                      <div className="new-price">{`${currency} ${calcFinalPrice(selectedPrice)}`}</div>
                                    </div>
                                  }
                                </div>
                                <div className="col-md-5 d-flex justify-content-end">
                                  <button
                                    type="button"
                                    className="btn btn-yellow btn-h60 font-18 font-demi w230 btn-order"
                                    onClick={order}
                                    style={{ marginTop: "20px" }}
                                  >
                                    {t('add to cart')}
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </div >
  );
};

export default MenuModalDetails;
