# frozen_string_literal: true

class FactsController < ApplicationController
  before_action :set_fact, only: %i[show edit update destroy]

  # GET /facts
  def index; end

  # GET /facts/1
  def show; end

  # GET /facts/list
  def list
    type = fact_params[:type] == 'history' ? 'history' : 'future'
    @text = ['title ilike :text', text: "%#{fact_params[:text]}%"] if fact_params[:text].present?
    @pagy, @facts = pagy(Fact.send(type).where(@text))
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_fact
    @fact = Fact.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def fact_params
    params.fetch(:filter, {}).permit(:text, :type)
  end
end
