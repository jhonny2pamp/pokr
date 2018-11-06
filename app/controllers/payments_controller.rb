class PaymentsController < ApplicationController

  protect_from_forgery except: :hook

  def create
    month = params[:billing][:month]
    order = Order.new({
      name: "Monthly premium payment",
      quantity: month,
      price: 7,
      user_id: current_user.id,
      currency: "USD",
      status: Order::INITIAL
    })

    payment = PaymentService.create order, success_payments_url, cancel_payments_url

    if payment.error.present?
      payment.error  # Error Hash
      redirect_to billing_path, flash: { error: payment.error }
    else
      order.update_attribute :payment_id, payment.id
      redirection_url = payment.links.find{|v| v.method == "REDIRECT" }.href
      redirect_to redirection_url
    end
  end

  def success
    payment_id = params.fetch(:paymentId, nil)
    if payment_id.present?
      @order = Order.find_by(payment_id: payment_id)
      @payment = PaymentService.execute_payment(
        payment_id: payment_id,
        payer_id: params[:PayerID]
      )
    end

    if @order && @payment && @payment.success?
      @order.update_attribute(:status, Order::SUCCESS)
      current_user.expand_premium_expiration @order.quantity * 1.month
      redirect_to billing_path, flash: { success: "Thanks for your payment, we'll work hard to serve you well 🤗" }
    else
      Rails.logger.error("Payment failure, order id: #{@order.id}, error: #{@payment.error}")
      redirect_to billing_path, flash: { error: "Payment failed :-|" }
    end
  end

  def cancel
    redirect_to billing_path, flash: { info: "Payment canceled." }
  end

  def hook
    order = Order.create(order_params)
    order.user.expand_premium_expiration order.quantity * 1.month

    head :no_content
  end

  private

  def order_params
    paddle_params = params.slice(:checkout_id, :coupon, :currency, :email, :order_id, :payment_method, :plan_name, :quantity, :receipt_url, :subscription_id, :unit_price)

    status = params[:alert_name] == "subscription_payment_succeeded" ? Order::SUCCESS : Order::FAILED

    user = User.find_by(email: paddle_params[:email])

    {
      status: status,
      name: paddle_params[:plan_name],
      quantity: paddle_params[:quantity],
      price: paddle_params[:unit_price],
      user_id: user.id,
      currency: paddle_params[:currency],
      payment_id: paddle_params[:payment_id],
      coupon: paddle_params[:coupon],
      checkout_id: paddle_params[:order_id],
      payment_method: paddle_params[:payment_method],
      receipt_url: paddle_params[:receipt_url],
      subscription_id: paddle_params[:subscription_id]
    }
  end

end
