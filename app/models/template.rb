# frozen_string_literal: true

# This model manage the questions template
# === Validations
# * presente of {template}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier for {Template}
# @!attribute [rw] title
#   @return [String] {Template} title
# @!attribute [rw] data
#   @return [Array] List of {Questions} attributes
# @!attribute [rw] created_at
#   @return [DateTime] when the record was created
# @!attribute [rw] updated_at
#   @return [DateTime] when the record was updated
class Template < ApplicationRecord
  validates :title, presence: true

  # set data attribute from a JSON string
  def data_string=(value)
    self.data = JSON.try :parse, value
  end

  # @return {data} value as json string
  def data_string
    data.to_json
  end
end
