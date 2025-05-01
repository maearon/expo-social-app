import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { theme } from "../constants/theme"
import { hp } from "../helpers/common"

export type ErrorMessageType = {
  [key: string]: string[]
}

type Props = {
  errorMessage: ErrorMessageType
}

const ErrorMessage: React.FC<Props> = ({ errorMessage }) => {
  if (!errorMessage || Object.keys(errorMessage).length === 0) {
    return null
  }

  const errorCount = Object.keys(errorMessage).length

  return (
    <View style={styles.container}>
      <View style={styles.alertContainer}>
        <Text style={styles.alertText}>
          The form contains {errorCount} error{errorCount !== 1 ? "s" : ""}
        </Text>
      </View>

      {Object.keys(errorMessage).map((key) => (
        <View key={key} style={styles.errorList}>
          {Array.isArray(errorMessage[key]) ? (
            errorMessage[key].map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {key} {error}
              </Text>
            ))
          ) : (
            <Text style={styles.errorText}>
              • {key}: {String(errorMessage[key])}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: theme.colors.rose,
  },
  alertContainer: {
    marginBottom: 8,
  },
  alertText: {
    color: theme.colors.rose,
    fontWeight: "600",
    fontSize: hp(1.8),
  },
  errorList: {
    marginLeft: 5,
  },
  errorText: {
    color: theme.colors.rose,
    fontSize: hp(1.6),
    marginBottom: 4,
  },
})

export default ErrorMessage
