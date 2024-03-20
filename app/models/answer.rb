# frozen_string_literal: true

# Manage {Quesion}s answer. Each answer is referred to a {Ticket}
#
# === Relations
#   - belongs to {Ticket}
#   - belongs to {Question}
#   - has one attached File
# === Validations
# * presence of {value} unless {category} is "file"
# * presence of {file} if {category} is "file"
# * absence of {value} if {category} is "file"
# * absence of {file} unles category is file
# * uniqueness of question scoped request
# * that {value} is included in {Option} if {question is select}
#
# @!method category()
#   @return [String] delegated from {Question#category}
# @!method category_file?()
#   @return [String] delegated from {Question#category}
# @!method category_select()
#   @return [String] delegated from {Question#category}
# @!method options()
#   @return [Array] delegated from {Question}
class Answer < ApplicationRecord
  belongs_to :ticket
  belongs_to :question
  has_one_attached :file

  delegate :category, :category_file?, :category_select?, :happening_id, :options, :mandatory?, :title, to: :question, allow_nil: true, prefix: true
  delegate :happening_id, to: :ticket, allow_nil: true, prefix: true
  delegate :attached?, to: :file, prefix: true

  validates :question, uniqueness: { scope: :ticket }
  validates :question_happening_id, comparison: { equal_to: :ticket_happening_id }
  validates :file, presence: true, if: :question_category_file?
  validates :value, absence: true, if: :question_category_file?
  validates :value, presence: true, if: :question_mandatory?, unless: :question_category_file?
  validates :value, inclusion: { in: :options_title }, if: :question_category_select?

  # @return list of valid option for value
  def options_title
    question_options.acceptable.pluck :title
  end
end
