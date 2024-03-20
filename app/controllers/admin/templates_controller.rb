# This controller manage the admin views for {Template} model
class Admin::TemplatesController < Admin::ApplicationController
  before_action :set_template, only: %i[ show edit update destroy ]

  # GET /admin/templates or /admin/templates.json
  def index
    @text = [ "title ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
    @pagy, @templates = pagy Template.where(@text)
  end

  # GET /admin/templates/1 or /admin/templates/1.json
  def show
  end

  # GET /admin/templates/new
  def new
    @template = Template.new
    respond_to do |format|
      format.html { redirect_to admin_templates_path }
      format.turbo_stream { render turbo_stream: turbo_stream.prepend('templates_list', Admin::Templates::EditComponent.new(template: @template)) }
    end
  end

  # GET /admin/templates/1/edit
  def edit
  end

  # POST /admin/templates or /admin/templates.json
  def create
    @template = Template.new(template_params)
    if @template.update(template_params)
      @component =  Admin::Templates::DetailComponent
    else
      @component =  Admin::Templates::EditComponent
    end
    render turbo_stream: turbo_stream.replace("new_template", @component.new(template: @template))
  end

  # PATCH/PUT /admin/templates/1 or /admin/templates/1.json
  def update
    if @template.update(template_params)
      @component =  Admin::Templates::DetailComponent
    else
      @component =  Admin::Templates::EditComponent
    end
    render turbo_stream: turbo_stream.replace("template_#{@template.id}", @component.new(template: @template))
  end

  # DELETE /admin/templates/1 or /admin/templates/1.json
  def destroy
    @template.destroy!

    respond_to do |format|
      format.html { redirect_to admin_templates_url, notice: "Template was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_template
      @template = Template.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def template_params
      params.require(:template).permit(:title, :data_string)
    end

    # Filter params for search an {User}
    def filter_params
      params.fetch(:filter, {}).permit(:text)
    end
end
